#!/usr/bin/env python3
"""
test_servidor_oficina.py — Pruebas unitarias del servidor de Oficina ApliArte.
"""

import json
import threading
import unittest
import urllib.request
import urllib.error
from http.server import HTTPServer
from pathlib import Path
import sys

DIR_REPOSITORIO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DIR_REPOSITORIO / "servidor"))

from servidor_oficina import (
    ManejadorOficina,
    listar_habilidades,
    obtener_habilidad,
    listar_resenas,
    obtener_resena,
    parsear_frontmatter,
)


class TestServidorOficina(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.puerto = 8798
        cls.servidor = HTTPServer(("127.0.0.1", cls.puerto), ManejadorOficina)
        cls.hilo = threading.Thread(target=cls.servidor.serve_forever, daemon=True)
        cls.hilo.start()
        cls.base_url = f"http://127.0.0.1:{cls.puerto}"
        cls.ruta_propuestas = DIR_REPOSITORIO / "datos" / "propuestas.json"
        cls.ruta_tareas = DIR_REPOSITORIO / "datos" / "tareas.json"
        cls.contenido_orig_propuestas = cls.ruta_propuestas.read_text(encoding="utf-8") if cls.ruta_propuestas.exists() else None
        cls.contenido_orig_tareas = cls.ruta_tareas.read_text(encoding="utf-8") if cls.ruta_tareas.exists() else None

    @classmethod
    def tearDownClass(cls):
        cls.servidor.shutdown()
        cls.servidor.server_close()
        if cls.contenido_orig_propuestas is not None:
            cls.ruta_propuestas.write_text(cls.contenido_orig_propuestas, encoding="utf-8")
        if cls.contenido_orig_tareas is not None:
            cls.ruta_tareas.write_text(cls.contenido_orig_tareas, encoding="utf-8")

    def test_parsear_frontmatter(self):
        ejemplo = "---\nname: prueba\ndescription: una prueba\n---\n# Contenido"
        meta = parsear_frontmatter(ejemplo)
        self.assertEqual(meta.get("name"), "prueba")
        self.assertEqual(meta.get("description"), "una prueba")

    def test_listar_habilidades(self):
        habs = listar_habilidades()
        self.assertTrue(len(habs) >= 1)
        nombres = [h["nombre"] for h in habs]
        self.assertIn("patito-de-goma", nombres)

    def test_obtener_habilidad(self):
        hab = obtener_habilidad("patito-de-goma")
        self.assertIsNotNone(hab)
        self.assertEqual(hab["nombre"], "patito-de-goma")
        self.assertIn("Protocolo canonico", hab["descripcion"])
        self.assertIn("Paso 1: Consultar la Memoria Persistente", hab["contenido"])

    def test_endpoint_estado(self):
        with urllib.request.urlopen(f"{self.base_url}/api/estado") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(datos["servicio"], "oficina-apliarte")
            self.assertEqual(datos["modo"], "solo_lectura")
            self.assertEqual(datos["estado"], "activo")
            self.assertTrue(datos["total_habilidades"] >= 1)
            self.assertTrue(datos["total_resenas"] >= 1)
            self.assertEqual(datos.get("total_pestanas"), 27)
            self.assertEqual(datos.get("pestanas_publicas"), 5)

    def test_endpoint_habilidades_lista(self):
        with urllib.request.urlopen(f"{self.base_url}/api/habilidades") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(datos["modo"], "solo_lectura")
            self.assertTrue(datos["total"] >= 1)
            nombres = [h["nombre"] for h in datos["habilidades"]]
            self.assertIn("patito-de-goma", nombres)

    def test_endpoint_habilidad_detalle(self):
        with urllib.request.urlopen(f"{self.base_url}/api/habilidades/patito-de-goma") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(datos["nombre"], "patito-de-goma")
            self.assertIn("contenido", datos)

    def test_bloqueo_metodos_escritura(self):
        req = urllib.request.Request(f"{self.base_url}/api/habilidades", method="POST")
        try:
            urllib.request.urlopen(req)
            self.fail("Deberia haber lanzado HTTPError 405")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 405)


    def test_listar_resenas(self):
        resenas = listar_resenas()
        self.assertTrue(len(resenas) >= 1)
        ids = [r["id"] for r in resenas]
        self.assertIn("resena-aplichat-001", ids)

    def test_obtener_resena(self):
        r = obtener_resena("resena-aplichat-001")
        self.assertIsNotNone(r)
        self.assertEqual(r["aplicacion"], "aplichat")
        self.assertEqual(r["tienda"], "App Store")
        self.assertIn("borrador_respuesta", r)

    def test_endpoint_resenas_lista(self):
        with urllib.request.urlopen(f"{self.base_url}/api/resenas") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(datos["modo"], "solo_lectura")
            self.assertTrue(datos["total"] >= 1)
            ids = [r["id"] for r in datos["resenas"]]
            self.assertIn("resena-aplichat-001", ids)

    def test_endpoint_resenas_filtro_app(self):
        with urllib.request.urlopen(f"{self.base_url}/api/resenas?app=aplichat") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(datos["total"] >= 1)
            for r in datos["resenas"]:
                self.assertEqual(r["aplicacion"], "aplichat")

    def test_endpoint_resena_detalle(self):
        with urllib.request.urlopen(f"{self.base_url}/api/resenas/resena-aplichat-001") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(datos["id"], "resena-aplichat-001")
            self.assertEqual(datos["aplicacion"], "aplichat")
            self.assertIn("borrador_respuesta", datos)

    def test_endpoint_resena_no_encontrada(self):
        try:
            urllib.request.urlopen(f"{self.base_url}/api/resenas/id-inexistente-999")
            self.fail("Deberia haber lanzado HTTPError 404")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 404)

    def test_bloqueo_escritura_resenas(self):
        req = urllib.request.Request(f"{self.base_url}/api/resenas", method="POST")
        try:
            urllib.request.urlopen(req)
            self.fail("Deberia haber lanzado HTTPError 405")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 405)

    def test_endpoint_pestanas_ecosistema(self):
        with urllib.request.urlopen(f"{self.base_url}/api/pestanas") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(datos["modo"], "solo_lectura")
            self.assertEqual(datos["total"], 27)
            slugs_publicos = [p["slug"] for p in datos["pestanas"] if p["publica"]]
            self.assertEqual(set(slugs_publicos), {"oficina", "propuestas", "aplicaciones", "paquetes", "skills"})

    def test_endpoint_tareas_get(self):
        with urllib.request.urlopen(f"{self.base_url}/api/tareas") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertIsInstance(datos, list)
            self.assertTrue(len(datos) >= 2)
            campos_7 = {"id", "titulo", "descripcion", "categoria", "estado", "autor", "fecha"}
            for t in datos:
                self.assertTrue(campos_7.issubset(set(t.keys())))
            titulos = [t["titulo"] for t in datos]
            self.assertTrue(any("Auditoría de Lectura Fluida" in tit for tit in titulos))
            self.assertTrue(any("Instalador Automatizado en Servidores Linux" in tit for tit in titulos))

    def test_endpoint_propuestas_get(self):
        with urllib.request.urlopen(f"{self.base_url}/api/propuestas") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertIsInstance(datos, list)
            self.assertTrue(len(datos) >= 2)
            campos_7 = {"id", "titulo", "descripcion", "categoria", "estado", "autor", "fecha"}
            for p in datos:
                self.assertTrue(campos_7.issubset(set(p.keys())))
            titulos = [p["titulo"] for p in datos]
            self.assertTrue(any("Afinar de Oído" in tit for tit in titulos))
            self.assertTrue(any("CalcaApp" in tit for tit in titulos))

    def test_endpoint_propuestas_post_valido(self):
        nueva = {
            "id": "propuesta-test-unitario",
            "titulo": "Prueba Unitaria de Propuesta",
            "descripcion": "Descripción concisa de prueba unitaria sin superar ochocientos caracteres.",
            "categoria": "CalcaApp",
            "estado": "Propuesta Comunitaria",
            "autor": "Tester",
            "fecha": "2026-11-08"
        }
        req = urllib.request.Request(
            f"{self.base_url}/api/propuestas",
            data=json.dumps(nueva).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 201)
            res = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(res.get("ok"))

    def test_endpoint_tareas_post_valido(self):
        nueva = {
            "id": "tarea-test-unitario",
            "titulo": "Prueba Unitaria de Tarea",
            "descripcion": "Descripción de tarea técnica para verificación de endpoint en pruebas.",
            "categoria": "Infraestructura",
            "estado": "Por Hacer",
            "autor": "Tester",
            "fecha": "2026-11-08"
        }
        req = urllib.request.Request(
            f"{self.base_url}/api/tareas",
            data=json.dumps(nueva).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 201)
            res = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(res.get("ok"))

    def test_endpoint_post_descripcion_larga_400(self):
        invalida = {
            "id": "propuesta-invalida-larga",
            "titulo": "Demasiado Larga",
            "descripcion": "A" * 801,
            "categoria": "General",
            "estado": "Propuesta",
            "autor": "Tester",
            "fecha": "2026-11-08"
        }
        req = urllib.request.Request(
            f"{self.base_url}/api/propuestas",
            data=json.dumps(invalida).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST"
        )
        try:
            urllib.request.urlopen(req)
            self.fail("Deberia haber lanzado HTTPError 400 por superar 800 caracteres")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)

    def test_endpoint_post_campo_faltante_400(self):
        incompleta = {
            "id": "propuesta-incompleta",
            "titulo": "Falta Descripcion",
            "categoria": "General",
            "estado": "Propuesta",
            "autor": "Tester",
            "fecha": "2026-11-08"
        }
        req = urllib.request.Request(
            f"{self.base_url}/api/propuestas",
            data=json.dumps(incompleta).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST"
        )
        try:
            urllib.request.urlopen(req)
            self.fail("Deberia haber lanzado HTTPError 400 por campo faltante")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)

    def test_endpoint_aplicaciones(self):
        with urllib.request.urlopen(f"{self.base_url}/api/aplicaciones") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertIsInstance(datos, list)
            self.assertTrue(len(datos) >= 4)
            ids = [a["id"] for a in datos]
            self.assertIn("calca-app", ids)
            self.assertIn("inem-sellar", ids)
            self.assertIn("aplichat", ids)
            self.assertIn("dictado-oficina", ids)

    def test_endpoint_paquetes(self):
        with urllib.request.urlopen(f"{self.base_url}/api/paquetes") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertIsInstance(datos, list)
            self.assertTrue(len(datos) >= 3)
            nombres = [p["nombre"] for p in datos]
            self.assertIn("apliarte_flutter_connect", nombres)
            self.assertIn("apliarte_remote_control", nombres)
            self.assertIn("tts_apliarte", nombres)

    def test_vista_pestana_privada_bloqueada(self):
        for ruta in ("/vista/aplichat", "/vista/tiendas", "/vista/facturas"):
            with urllib.request.urlopen(f"{self.base_url}{ruta}") as resp:
                self.assertEqual(resp.status, 200)
                self.assertIn("text/html", resp.headers.get("Content-Type", ""))
                html = resp.read().decode("utf-8")
                self.assertIn("blurred-content", html)
                self.assertIn("Instala tu Oficina en Hostinger", html)
                self.assertIn("Pestaña Privada", html)

    def test_vista_raiz_index(self):
        for ruta in ("/", "/index.html"):
            with urllib.request.urlopen(f"{self.base_url}{ruta}") as resp:
                self.assertEqual(resp.status, 200)
                self.assertIn("text/html", resp.headers.get("Content-Type", ""))
                html = resp.read().decode("utf-8")
                self.assertIn("Oficina ApliArte", html)
                self.assertIn("Panel de control operativo ApliArte", html)
                self.assertIn("Tablero de tareas", html)
                self.assertNotIn("vistas/", html)

    def test_recursos_css_autenticos(self):
        for ruta in ("/panel-shell.css", "/estilos/tokens.css", "/estilos/componentes.css"):
            with urllib.request.urlopen(f"{self.base_url}{ruta}") as resp:
                self.assertEqual(resp.status, 200)
                self.assertIn("text/css", resp.headers.get("Content-Type", ""))
                contenido = resp.read().decode("utf-8")
                self.assertTrue(len(contenido) > 50)

    def test_vistas_secundarias_retiradas(self):
        for ruta in (
            "/vistas/skills.html",
            "/vistas/resenas.html",
            "/vistas/instala-tu-oficina.html",
            "/vistas/aplicaciones.html",
            "/vistas/paquetes.html",
            "/vistas/tareas.html",
            "/vistas/propuestas.html",
            "/vistas/escaparate.js",
        ):
            try:
                urllib.request.urlopen(f"{self.base_url}{ruta}")
                self.fail(f"Ruta obsoleta {ruta} deberia devolver 404")
            except urllib.error.HTTPError as e:
                self.assertEqual(e.code, 404)

    def test_archivos_obsoletos_en_control_erbolamm(self):
        dir_archivo = DIR_REPOSITORIO / "control-erbolamm" / "archivado-vistas"
        dir_vistas = DIR_REPOSITORIO / "vistas"
        self.assertTrue(dir_archivo.exists())
        archivos_esperados = [
            "aplicaciones.html",
            "paquetes.html",
            "propuestas.html",
            "skills.html",
            "tareas.html",
            "resenas.html",
            "instala-tu-oficina.html",
            "escaparate.js",
        ]
        for nombre in archivos_esperados:
            self.assertTrue((dir_archivo / nombre).exists(), f"{nombre} debe existir en archivado-vistas")
            self.assertFalse((dir_vistas / nombre).exists(), f"{nombre} no debe existir en vistas/")

    def test_datos_estaticos_json(self):
        for ruta in ("/datos/habilidades.json", "/datos/resenas.json", "/datos/pestanas.json", "/datos/aplicaciones.json", "/datos/paquetes.json", "/datos/tareas.json", "/datos/propuestas.json"):
            with urllib.request.urlopen(f"{self.base_url}{ruta}") as resp:
                self.assertEqual(resp.status, 200)
                self.assertIn("application/json", resp.headers.get("Content-Type", ""))
                datos = json.loads(resp.read().decode("utf-8"))
                self.assertIsNotNone(datos)

    def test_cabecera_allow_en_error_405(self):
        req = urllib.request.Request(f"{self.base_url}/api/habilidades", method="POST")
        try:
            urllib.request.urlopen(req)
            self.fail("Deberia haber lanzado HTTPError 405")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 405)
            self.assertIn("GET", e.headers.get("Allow", ""))

    def test_metodo_patch_bloqueado_405(self):
        req = urllib.request.Request(f"{self.base_url}/api/habilidades", method="PATCH")
        try:
            urllib.request.urlopen(req)
            self.fail("Deberia haber lanzado HTTPError 405")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 405)

    def test_metodo_options_permitido(self):
        req = urllib.request.Request(f"{self.base_url}/api/habilidades", method="OPTIONS")
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 204)
            self.assertIn("GET", resp.headers.get("Access-Control-Allow-Methods", ""))

    def test_favicon_svg(self):
        with urllib.request.urlopen(f"{self.base_url}/favicon.svg") as resp:
            self.assertEqual(resp.status, 200)
            self.assertIn("image/svg+xml", resp.headers.get("Content-Type", ""))

    def test_manifest_json(self):
        with urllib.request.urlopen(f"{self.base_url}/manifest.json") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(datos.get("name"), "Oficina ApliArte")
            self.assertEqual(datos.get("display"), "standalone")


if __name__ == "__main__":
    unittest.main()
