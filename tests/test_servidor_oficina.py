#!/usr/bin/env python3
"""
test_servidor_oficina.py — Pruebas unitarias del servidor de Oficina ApliArte.
"""

import json
import re
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
            self.assertEqual(datos.get("total_pestanas"), 33)
            self.assertEqual(datos.get("pestanas_publicas"), 12)

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
            self.assertEqual(datos["total"], 33)
            slugs_publicos = [p["slug"] for p in datos["pestanas"] if p["publica"]]
            self.assertEqual(set(slugs_publicos), {"oficina", "propuestas", "aplicaciones", "paquetes", "skills", "verticales", "agentes", "como-funciona", "herdr", "radar", "visita-guiada", "directo"})

    def test_vista_directo_demo_segura(self):
        with urllib.request.urlopen(f"{self.base_url}/vista/directo") as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode("utf-8")
            self.assertIn("https://directo.apliarte.com/", html)
            self.assertIn("<iframe", html)
            self.assertIn("twitch.tv/apliarte", html)
            self.assertNotIn("192.168.", html)
            self.assertNotIn("rtmp://", html)

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
            headers={"Content-Type": "application/json; charset=utf-8", "X-ErBolamm-Action": "crear"},
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
            headers={"Content-Type": "application/json; charset=utf-8", "X-ErBolamm-Action": "crear"},
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
            headers={"Content-Type": "application/json; charset=utf-8", "X-ErBolamm-Action": "crear"},
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
            headers={"Content-Type": "application/json; charset=utf-8", "X-ErBolamm-Action": "crear"},
            method="POST"
        )
        try:
            urllib.request.urlopen(req)
            self.fail("Deberia haber lanzado HTTPError 400 por campo faltante")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)

    def test_endpoint_post_sin_accion_403(self):
        nueva = {
            "id": "propuesta-sin-cabecera",
            "titulo": "Sin cabecera de accion",
            "descripcion": "Debe rechazarse con 403.",
            "categoria": "General",
            "estado": "Propuesta",
            "autor": "Tester",
            "fecha": "2026-11-19"
        }
        req = urllib.request.Request(
            f"{self.base_url}/api/propuestas",
            data=json.dumps(nueva).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST"
        )
        try:
            urllib.request.urlopen(req)
            self.fail("Deberia haber lanzado HTTPError 403 sin X-ErBolamm-Action")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 403)

    def test_confinamiento_rutas_404(self):
        for ruta in ("/datos/../panel-shell.js", "/estilos/../index.html", "/componentes/../package.json", "/vistas/../index.html"):
            try:
                urllib.request.urlopen(f"{self.base_url}{ruta}")
                self.fail(f"Ruta fuera de confinamiento respondio 200: {ruta}")
            except urllib.error.HTTPError as e:
                self.assertEqual(e.code, 404)

    def test_endpoint_aplicaciones(self):
        with urllib.request.urlopen(f"{self.base_url}/api/aplicaciones") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertIsInstance(datos, list)
            self.assertGreaterEqual(len(datos), 7)
            ids = [a["id"] for a in datos]
            expected_ids = {
                "calca-app", "inem-sellar", "me-llaman", "afinar-de-oido",
                "mira-quien-llama", "aplichat", "dictado-oficina",
            }
            self.assertTrue(expected_ids.issubset(ids))

            catalog_json = json.dumps(datos, ensure_ascii=False)
            emoji_pattern = re.compile(
                "[\\U0001F000-\\U0001FAFF\\U00002600-\\U000027BF"
                "\\U00002300-\\U000023FF\\uFE0F\\u20E3]"
            )
            self.assertIsNone(emoji_pattern.search(catalog_json))
            broken_domains = (
                "calca.app", "id6449416560", "appgallery.huawei.com", "amazon.es",
                "inemsellar.apliarte.com", "aplichat.apliarte.com", "oficina.apliarte.com",
            )
            for domain in broken_domains:
                self.assertNotIn(domain, catalog_json)

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

    def test_endpoint_verticales(self):
        with urllib.request.urlopen(f"{self.base_url}/api/verticales") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertIsInstance(datos, list)
            self.assertGreaterEqual(len(datos), 3)
            ids = [v["id"] for v in datos]
            self.assertIn("ejemplo-hosteleria", ids)
            self.assertIn("ejemplo-gestoria", ids)
            self.assertIn("ejemplo-autonomo", ids)
            self.assertIn("ejemplo-alojamiento", ids)
            for mod in datos:
                self.assertTrue(len(mod.get("habilidades_motor", [])) > 0)
                terms_str = " ".join(mod.get("terminales_compatibles", []))
                self.assertIn("Gemini", terms_str)
                self.assertIn("Claude", terms_str)
                self.assertIn("Grok", terms_str)
                self.assertIn("Codex", terms_str)
                self.assertTrue(mod.get("terminales_libres"))

            catalog_json = json.dumps(datos, ensure_ascii=False)
            emoji_pattern = re.compile(
                "[\\U0001F000-\\U0001FAFF\\U00002600-\\U000027BF"
                "\\U00002300-\\U000023FF\\uFE0F\\u20E3]"
            )
            self.assertIsNone(emoji_pattern.search(catalog_json))

    def test_vista_verticales(self):
        with urllib.request.urlopen(f"{self.base_url}/vista/verticales") as resp:
            self.assertEqual(resp.status, 200)
            html_text = resp.read().decode("utf-8")
            self.assertIn("Módulos Verticales", html_text)
            self.assertIn("Capa visual modular para activar en local", html_text)
            self.assertIn("¿Por qué ApliArte?", html_text)
            self.assertIn("¿Para qué sirve?", html_text)
            self.assertIn("¿Con qué fin contratarlo?", html_text)
            self.assertIn("Modelo abierto y servicios profesionales a medida", html_text)
            self.assertIn("Uso libre y gratuito en local por tu cuenta", html_text)
            self.assertIn("presupuesto a medida y sin compromiso", html_text)
            self.assertIn("Sin tarifas cerradas ni precios fijos", html_text)
            self.assertIn("Salvaguarda del Camino Rojo", html_text)
            self.assertIn("Confirmación Humana en 1 Clic", html_text)
            self.assertIn("Validación determinista y control humano", html_text)
            self.assertIn("simuladores-camino-rojo", html_text)
            self.assertIn("borrador-tributario-modelo-303", html_text)
            self.assertIn("Probar borrador (Camino Rojo)", html_text)
            self.assertIn("btn-contextual-feedback", html_text)
            self.assertIn("feedback-icon-svg", html_text)
            self.assertIn("panel-shell.css", html_text)
            self.assertIn("panel-shell.js", html_text)

    def test_seccion_agradecimientos_proyectos_abiertos(self):
        # Verificar que la sección existe en vistas/como-funciona.html y README.md
        with urllib.request.urlopen(f"{self.base_url}/vista/como-funciona") as resp:
            self.assertEqual(resp.status, 200)
            html_text = resp.read().decode("utf-8")
            self.assertIn("Agradecimientos y proyectos abiertos", html_text)
            self.assertIn("Flutter y Dart", html_text)
            self.assertIn("Herdr", html_text)
            self.assertIn("Engram", html_text)
            self.assertIn("Tailscale", html_text)
            self.assertIn("Ollama y llama.cpp", html_text)
            self.assertIn("mlx-whisper, Kokoro y Piper", html_text)
            self.assertIn("rea-agents", html_text)
            prohibido = "".join(["gentle", "-", "ai"])
            self.assertNotIn(prohibido, html_text.lower())

    def test_endpoint_borradores_camino_rojo(self):
        with urllib.request.urlopen(f"{self.base_url}/api/borradores-camino-rojo") as resp:
            self.assertEqual(resp.status, 200)
            datos = json.loads(resp.read().decode("utf-8"))
            self.assertIsInstance(datos, list)
            self.assertGreaterEqual(len(datos), 4)
            modulos = [b["modulo_id"] for b in datos]
            self.assertIn("ejemplo-autonomo", modulos)
            self.assertIn("ejemplo-gestoria", modulos)
            self.assertIn("ejemplo-alojamiento", modulos)
            self.assertIn("ejemplo-hosteleria", modulos)
            for b in datos:
                self.assertIn("id", b)
                self.assertIn("modulo_nombre", b)
                self.assertIn("accion_solicitada", b)
                self.assertIn("motivo_firma_humana", b)
                self.assertIn("destinatario_entidad", b)
                self.assertIn("resumen", b)
                self.assertIn("detalle_tecnico", b)
                self.assertEqual(b.get("camino"), "rojo")

            raw_json = json.dumps(datos, ensure_ascii=False)
            emoji_pattern = re.compile(
                "[\\U0001F000-\\U0001FAFF\\U00002600-\\U000027BF"
                "\\U00002300-\\U000023FF\\uFE0F\\u20E3]"
            )
            self.assertIsNone(emoji_pattern.search(raw_json))

    def test_modal_confirmacion_humana_en_index(self):
        with urllib.request.urlopen(f"{self.base_url}/index.html") as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode("utf-8")
            self.assertIn('id="modal-confirmacion-humana"', html)
            self.assertIn('id="modal-confirmacion-titulo"', html)
            self.assertIn("Confirmación humana en 1 clic", html)
            self.assertIn("badge-camino-rojo", html)
            self.assertIn("¿Por qué requiere confirmación humana?", html)
            self.assertIn('id="btn-ejecutar-confirmacion"', html)
            self.assertIn("Confirmar y ejecutar", html)
            self.assertIn('id="btn-cancelar-confirmacion"', html)
            self.assertIn("Cancelar", html)

    def test_modal_confirmacion_humana_en_panel_shell_js(self):
        with urllib.request.urlopen(f"{self.base_url}/panel-shell.js") as resp:
            self.assertEqual(resp.status, 200)
            js_code = resp.read().decode("utf-8")
            self.assertIn("abrirConfirmacionCaminoRojo", js_code)
            self.assertIn("ensureHumanConfirmationModal", js_code)
            self.assertIn("modal-confirmacion-humana", js_code)
            self.assertIn("btn-ejecutar-confirmacion", js_code)
            self.assertIn("btn-cancelar-confirmacion", js_code)
            self.assertIn("camino-rojo:confirmado", js_code)
            self.assertIn("camino-rojo:cancelado", js_code)

    def test_topbar_feedback_legend(self):
        with urllib.request.urlopen(f"{self.base_url}/index.html") as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode("utf-8")
            self.assertIn("topbar-feedback-legend", html)
            self.assertIn("¿Tienes algo que comentar, proponer o dar una idea de mejora? Pulsa en", html)
            self.assertIn("btn-contextual-feedback inline-feedback-btn", html)
            self.assertIn("feedback-icon-svg", html)
            self.assertIn("https://github.com/erbolamm/oficina-apliarte/issues/new", html)

    def test_feedback_contextual_en_construccion(self):
        with urllib.request.urlopen(f"{self.base_url}/vista/seo") as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode("utf-8")
            self.assertIn("btn-contextual-feedback", html)
            self.assertIn("feedback-icon-svg", html)
            self.assertIn("https://github.com/erbolamm/oficina-apliarte/issues/new", html)
            self.assertIn("En%20construcci", html)

    def test_vista_pestana_privada_bloqueada(self):
        for ruta in ("/vista/aplichat", "/vista/tiendas", "/vista/facturas", "/vista/seo"):
            with urllib.request.urlopen(f"{self.base_url}{ruta}") as resp:
                self.assertEqual(resp.status, 200)
                self.assertIn("text/html", resp.headers.get("Content-Type", ""))
                html = resp.read().decode("utf-8")
                self.assertTrue("blurred-content" in html or "En construcción" in html)

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
            "tareas.html",
            "resenas.html",
            "instala-tu-oficina.html",
            "escaparate.js",
        ]
        for nombre in archivos_esperados:
            self.assertTrue((dir_archivo / nombre).exists(), f"{nombre} debe existir en archivado-vistas")
            self.assertFalse((dir_vistas / nombre).exists(), f"{nombre} no debe existir en vistas/")
        for nombre in ("aplicaciones.html", "paquetes.html", "propuestas.html", "skills.html", "verticales.html"):
            self.assertTrue((dir_vistas / nombre).exists(), f"{nombre} debe existir como vista activa en vistas/")

    def test_datos_estaticos_json(self):
        for ruta in ("/datos/habilidades.json", "/datos/resenas.json", "/datos/pestanas.json", "/datos/aplicaciones.json", "/datos/paquetes.json", "/datos/tareas.json", "/datos/propuestas.json", "/datos/verticales.json", "/datos/borradores-camino-rojo.json"):
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


    def test_pestana_aplicaciones_escaparate(self):
        with urllib.request.urlopen(f"{self.base_url}/index.html") as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode("utf-8")
            self.assertIn('id="tab-btn-aplicaciones"', html)
            self.assertIn('pill-btn-destacado', html)
            self.assertIn('id="aplicaciones-panel"', html)
            self.assertIn('id="apps-showcase-grid"', html)
            self.assertIn('id="apps-filters"', html)
            self.assertIn('id="sidebar-nav-aplicaciones"', html)
            self.assertNotIn("/vista/aplicaciones", html)
            self.assertNotIn('fetch("/', html)
            self.assertNotIn("fetch('/", html)

    def test_tablero_cuatro_columnas_intacto(self):
        with urllib.request.urlopen(f"{self.base_url}/index.html") as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode("utf-8")
            self.assertIn('id="lane-propuestas"', html)
            self.assertIn('id="lane-por-hacer"', html)

    def test_vista_tareas_y_tablero_con_y_sin_barra(self):
        for ruta in ("/vista/tareas", "/vista/tareas/", "/vista/tablero", "/vista/tablero/"):
            with urllib.request.urlopen(f"{self.base_url}{ruta}") as resp:
                self.assertEqual(resp.status, 200)
                html = resp.read().decode("utf-8")
                self.assertIn("resolverRutaRaiz", html)
                self.assertIn('href="/panel-shell.css', html)
            self.assertIn('id="lane-en-curso"', html)
            self.assertIn('id="lane-hecho"', html)
            self.assertIn('repeat(4, minmax(0, 1fr))', html)

    def test_boton_info_sin_duplicados_ni_anidamiento(self):
        with urllib.request.urlopen(f"{self.base_url}/panel-shell.js") as resp:
            self.assertEqual(resp.status, 200)
            js = resp.read().decode("utf-8")
            self.assertIn("window.self !== window.top", js)
            self.assertIn("if (window.self !== window.top || esModoLimpio) return;", js)
            self.assertIn("comoCard.click()", js)

        with urllib.request.urlopen(f"{self.base_url}/panel-shell.css") as resp:
            self.assertEqual(resp.status, 200)
            css = resp.read().decode("utf-8")
            self.assertIn("body > a.guide-info", css)
            self.assertIn("display: none !important", css)

        with urllib.request.urlopen(f"{self.base_url}/index.html") as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode("utf-8")
            self.assertIn("window.self !== window.top", html)
            self.assertIn("window.top.location.href = window.location.href", html)

    def test_ancla_verticales_autonomos(self):
        # 1. Verificar datos de Autonomos en /api/verticales (sin fugas ni precios fijos)
        with urllib.request.urlopen(f"{self.base_url}/api/verticales") as resp:
            self.assertEqual(resp.status, 200)
            verticales = json.loads(resp.read().decode("utf-8"))
            autonomo = next((v for v in verticales if v.get("id") == "ejemplo-autonomo"), None)
            self.assertIsNotNone(autonomo)
            self.assertEqual(autonomo.get("ancla"), "verticales-autonomos")
            desc = autonomo.get("descripcion", "").lower()
            self.assertIn("100% gratuito", desc)
            self.assertIn("codigo abierto", desc)
            self.assertIn("presupuesto a medida y sin compromiso", desc)
            self.assertNotIn("€", desc)
            self.assertNotIn("/" + "users" + "/", desc)
            self.assertNotIn("~" + "/trabajo/", desc)

        # 2. Verificar que panel-shell.js enruta #verticales-autonomos hacia /vista/verticales con el hash
        with urllib.request.urlopen(f"{self.base_url}/panel-shell.js") as resp:
            self.assertEqual(resp.status, 200)
            js = resp.read().decode("utf-8")
            self.assertIn("function resolveHashRoute(rawHash)", js)
            self.assertIn('clean.startsWith("verticales-")', js)
            self.assertIn('vista: "verticales"', js)
            self.assertIn("ev.targetAnchorHash = resolvedHash", js)
            self.assertIn("openHashRouteIfMatched(window.location.hash)", js)
            self.assertIn('encodeURIComponent(slug) + (window.location.hash || "")', js)

        # 3. Verificar que /vista/verticales asigna el ancla y enfoca el bloque de Autonomos
        with urllib.request.urlopen(f"{self.base_url}/vista/verticales") as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode("utf-8")
            self.assertIn('"ejemplo-autonomo": "verticales-autonomos"', html)
            self.assertIn('"verticales-autonomos": "ejemplo-autonomo"', html)
            self.assertIn("function focusVerticalFromHash()", html)
            self.assertIn('targetCard.classList.add("vertical-focused")', html)
            self.assertIn('targetCard.setAttribute("data-focused-vertical", "true")', html)
            self.assertIn('window.addEventListener("hashchange", focusVerticalFromHash)', html)


if __name__ == "__main__":
    unittest.main()
