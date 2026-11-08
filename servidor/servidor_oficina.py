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
from urllib.parse import urlparse, parse_qs

RAIZ_PROYECTO = Path(__file__).resolve().parent.parent
DIR_HABILIDADES = RAIZ_PROYECTO / "habilidades"
DIR_VISTAS = RAIZ_PROYECTO / "vistas"
DIR_RESENAS = RAIZ_PROYECTO / "resenas"


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


def listar_resenas(aplicacion: str | None = None) -> list:
    resultado = []
    if not DIR_RESENAS.exists():
        return resultado

    # 1. Cargar archivo consolidado borradores.json si existe
    archivo_consolidado = DIR_RESENAS / "borradores.json"
    if archivo_consolidado.exists():
        try:
            datos = json.loads(archivo_consolidado.read_text(encoding="utf-8"))
            if isinstance(datos, list):
                resultado.extend(datos)
        except Exception:
            pass

    # 2. Cargar archivos individuales .json en resenas/
    for ruta_json in DIR_RESENAS.glob("*.json"):
        if ruta_json.name == "borradores.json":
            continue
        try:
            datos = json.loads(ruta_json.read_text(encoding="utf-8"))
            if isinstance(datos, list):
                resultado.extend(datos)
            elif isinstance(datos, dict):
                resultado.append(datos)
        except Exception:
            pass

    # Filtrar por aplicacion si se solicita
    if aplicacion:
        app_filtro = aplicacion.strip().lower()
        resultado = [r for r in resultado if str(r.get("aplicacion", "")).strip().lower() == app_filtro]

    return resultado


def obtener_resena(id_resena: str) -> dict | None:
    for r in listar_resenas():
        if str(r.get("id")) == id_resena:
            return r
    return None


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

    def responder_html(self, html_texto: str, codigo: int = 200):
        cuerpo = html_texto.encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("X-Modo-Oficina", "solo_lectura")
        self.end_headers()
        self.wfile.write(cuerpo)

    def responder_error(self, mensaje: str, codigo: int = 404):
        self.responder_json({"error": mensaje, "codigo": codigo}, codigo=codigo)

    def do_GET(self):
        parsed = urlparse(self.path)
        ruta = parsed.path.rstrip("/")

        if ruta == "" or ruta == "/" or ruta == "/vista/skills" or ruta == "/skills":
            archivo_vista = DIR_VISTAS / "skills.html"
            if archivo_vista.exists():
                self.responder_html(archivo_vista.read_text(encoding="utf-8"))
                return

        if ruta in ("/resenas", "/vista/resenas"):
            archivo_vista = DIR_VISTAS / "resenas.html"
            if archivo_vista.exists():
                self.responder_html(archivo_vista.read_text(encoding="utf-8"))
                return

        if ruta == "/api/estado":
            self.responder_json({
                "servicio": "oficina-apliarte",
                "estado": "activo",
                "modo": "solo_lectura",
                "version": "0.1.0",
                "total_habilidades": len(listar_habilidades()),
                "total_resenas": len(listar_resenas()),
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

        if ruta == "/api/resenas":
            query = parse_qs(parsed.query)
            app_param = query.get("app", [None])[0]
            resenas = listar_resenas(aplicacion=app_param)
            self.responder_json({
                "modo": "solo_lectura",
                "total": len(resenas),
                "resenas": resenas,
            })
            return

        match_resena = re.match(r"^/api/resenas/([a-zA-Z0-9_\-]+)$", ruta)
        if match_resena:
            id_resena = match_resena.group(1)
            resena = obtener_resena(id_resena)
            if resena:
                self.responder_json(resena)
            else:
                self.responder_error(f"Resena '{id_resena}' no encontrada", 404)
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
