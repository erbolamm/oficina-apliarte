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


if __name__ == "__main__":
    unittest.main()
