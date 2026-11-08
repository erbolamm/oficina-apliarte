#!/usr/bin/env python3
"""
servidor_oficina.py — Servidor HTTP ligero y soberano de Oficina ApliArte.
Modo de solo lectura para consulta y descarga de habilidades y metadatos.
"""

import json
import os
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

RAIZ_PROYECTO = Path(__file__).resolve().parent.parent
DIR_HABILIDADES = RAIZ_PROYECTO / "habilidades"


def parsear_frontmatter(texto: str) -> dict:
    metadatos = {}
    if texto.startswith("---"):
        partes = texto.split("---", 2)
        if len(partes) >= 3:
            for linea in partes[1].strip().splitlines():
                if ":" in linea:
                    clave, valor = linea.split(":", 1)
                    metadatos[clave.strip()] = valor.strip()
    return metadatos


def listar_habilidades() -> list:
    resultado = []
    if not DIR_HABILIDADES.exists():
        return resultado

    for ruta_skill in DIR_HABILIDADES.glob("*/SKILL.md"):
        nombre = ruta_skill.parent.name
        contenido = ruta_skill.read_text(encoding="utf-8")
        meta = parsear_frontmatter(contenido)
        resultado.append({
            "nombre": meta.get("name", nombre),
            "descripcion": meta.get("description", ""),
            "ruta_relativa": str(ruta_skill.relative_to(RAIZ_PROYECTO)),
        })
    resultado.sort(key=lambda x: x["nombre"])
    return resultado


def obtener_habilidad(nombre: str) -> dict | None:
    ruta_skill = DIR_HABILIDADES / nombre / "SKILL.md"
    if not ruta_skill.exists():
        return None
    contenido = ruta_skill.read_text(encoding="utf-8")
    meta = parsear_frontmatter(contenido)
    return {
        "nombre": meta.get("name", nombre),
        "descripcion": meta.get("description", ""),
        "contenido": contenido,
        "ruta_relativa": str(ruta_skill.relative_to(RAIZ_PROYECTO)),
    }


class ManejadorOficina(BaseHTTPRequestHandler):
    server_version = "OficinaApliArte/0.1.0"

    def responder_json(self, datos: dict, codigo: int = 200):
        cuerpo = json.dumps(datos, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("X-Modo-Oficina", "solo_lectura")
        self.end_headers()
        self.wfile.write(cuerpo)

    def responder_error(self, mensaje: str, codigo: int = 404):
        self.responder_json({"error": mensaje, "codigo": codigo}, codigo=codigo)

    def do_GET(self):
        parsed = urlparse(self.path)
        ruta = parsed.path.rstrip("/")

        if ruta == "" or ruta == "/api/estado":
            self.responder_json({
                "servicio": "oficina-apliarte",
                "estado": "activo",
                "modo": "solo_lectura",
                "version": "0.1.0",
                "total_habilidades": len(listar_habilidades()),
            })
            return

        if ruta == "/api/habilidades":
            self.responder_json({
                "modo": "solo_lectura",
                "total": len(listar_habilidades()),
                "habilidades": listar_habilidades(),
            })
            return

        match = re.match(r"^/api/habilidades/([a-zA-Z0-9_\-]+)$", ruta)
        if match:
            nombre = match.group(1)
            hab = obtener_habilidad(nombre)
            if hab:
                self.responder_json(hab)
            else:
                self.responder_error(f"Habilidad '{nombre}' no encontrada", 404)
            return

        self.responder_error(f"Ruta '{ruta}' no encontrada en modo solo lectura", 404)

    def do_POST(self):
        self.responder_error("Metodo POST bloqueado: servidor en modo exclusivo de solo lectura", 405)

    def do_PUT(self):
        self.responder_error("Metodo PUT bloqueado: servidor en modo exclusivo de solo lectura", 405)

    def do_DELETE(self):
        self.responder_error("Metodo DELETE bloqueado: servidor en modo exclusivo de solo lectura", 405)

    def log_message(self, format, *args):
        # Silenciar logs en consola estandar salvo errores criticos
        pass


def arrancar_servidor(puerto: int = 8795, host: str = "127.0.0.1"):
    servidor = HTTPServer((host, puerto), ManejadorOficina)
    print(f"Servidor Oficina ApliArte escuchando en http://{host}:{puerto} (solo lectura)")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        servidor.server_close()
        print("\nServidor detenido de forma limpia.")


if __name__ == "__main__":
    puerto_env = int(os.environ.get("OFICINA_PUERTO", "8795"))
    host_env = os.environ.get("OFICINA_HOST", "127.0.0.1")
    arrancar_servidor(puerto=puerto_env, host=host_env)
