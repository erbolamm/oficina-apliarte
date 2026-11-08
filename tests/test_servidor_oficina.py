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

    @classmethod
    def tearDownClass(cls):
        cls.servidor.shutdown()
        cls.servidor.server_close()

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
            self.assertEqual(datos.get("pestanas_publicas"), 3)

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

    def test_vista_skills(self):
        with urllib.request.urlopen(f"{self.base_url}/vista/skills") as resp:
            self.assertEqual(resp.status, 200)
            self.assertIn("text/html", resp.headers.get("Content-Type", ""))
            html = resp.read().decode("utf-8")
            self.assertIn("Oficina ApliArte — Banco de Habilidades", html)
            self.assertIn("Modo Solo Lectura", html)

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

    def test_vista_resenas(self):
        for ruta in ("/resenas", "/vista/resenas"):
            with urllib.request.urlopen(f"{self.base_url}{ruta}") as resp:
                self.assertEqual(resp.status, 200)
                self.assertIn("text/html", resp.headers.get("Content-Type", ""))
                html = resp.read().decode("utf-8")
                self.assertIn("Oficina ApliArte — Gestion de Resenas", html)
                self.assertIn("Modo Solo Lectura", html)

    def test_bloqueo_escritura_resenas(self):
        req = urllib.request.Request(f"{self.base_url}/api/resenas", method="POST")
        try:
            urllib.request.urlopen(req)
            self.fail("Deberia haber lanzado HTTPError 405")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 405)

    def test_vista_instala_tu_oficina(self):
        for ruta in ("/vista/instala-tu-oficina", "/instala-tu-oficina"):
            with urllib.request.urlopen(f"{self.base_url}{ruta}") as resp:
                self.assertEqual(resp.status, 200)
                self.assertIn("text/html", resp.headers.get("Content-Type", ""))
                html = resp.read().decode("utf-8")
                self.assertIn("Oficina ApliArte — Instala tu Oficina", html)
                self.assertIn("APLIARTE", html)
                self.assertIn("Hola Kodee", html)

    def test_endpoint_pestanas_ecosistema(self):
        with urllib.request.urlopen(f"{self.base_url}/api/pestanas") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(datos["modo"], "solo_lectura")
            self.assertEqual(datos["total"], 27)
            slugs_publicos = [p["slug"] for p in datos["pestanas"] if p["publica"]]
            self.assertEqual(set(slugs_publicos), {"skills", "resenas", "instala-tu-oficina"})

    def test_vista_pestana_privada_bloqueada(self):
        for ruta in ("/vista/aplichat", "/vista/propuestas", "/vista/facturas"):
            with urllib.request.urlopen(f"{self.base_url}{ruta}") as resp:
                self.assertEqual(resp.status, 200)
                self.assertIn("text/html", resp.headers.get("Content-Type", ""))
                html = resp.read().decode("utf-8")
                self.assertIn("blurred-content", html)
                self.assertIn("Instala tu Oficina en Hostinger", html)
                self.assertIn("Pestaña Privada", html)

    def test_archivo_escaparate_js(self):
        with urllib.request.urlopen(f"{self.base_url}/vistas/escaparate.js") as resp:
            self.assertEqual(resp.status, 200)
            self.assertIn("javascript", resp.headers.get("Content-Type", ""))
            js = resp.read().decode("utf-8")
            self.assertIn("PESTANAS_ECOSISTEMA", js)

    def test_vista_raiz_index(self):
        for ruta in ("/", "/index.html"):
            with urllib.request.urlopen(f"{self.base_url}{ruta}") as resp:
                self.assertEqual(resp.status, 200)
                self.assertIn("text/html", resp.headers.get("Content-Type", ""))
                html = resp.read().decode("utf-8")
                self.assertIn("Oficina ApliArte", html)
                self.assertIn("Suite Soberana", html)

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
