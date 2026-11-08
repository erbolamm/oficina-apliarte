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
DIR_DATOS = RAIZ_PROYECTO / "datos"

PESTANAS_ECOSISTEMA = [
    {"slug": "skills", "titulo": "Banco de Habilidades", "ruta": "/vista/skills", "publica": True},
    {"slug": "resenas", "titulo": "Reseñas de Tiendas", "ruta": "/resenas", "publica": True},
    {"slug": "instala-tu-oficina", "titulo": "Instala tu Oficina", "ruta": "/vista/instala-tu-oficina", "publica": True},
    {"slug": "propuestas", "titulo": "Bandeja de Propuestas y Aprendizajes", "ruta": "/vista/propuestas", "publica": False},
    {"slug": "aplichat", "titulo": "ApliChat y Buzón de Conversación", "ruta": "/vista/aplichat", "publica": False},
    {"slug": "tiendas", "titulo": "Tiendas y Metadatos ASO", "ruta": "/vista/tiendas", "publica": False},
    {"slug": "diseno", "titulo": "Capturas Retina y Mockups", "ruta": "/vista/diseno", "publica": False},
    {"slug": "musica", "titulo": "Música Procedural Strudel", "ruta": "/vista/musica", "publica": False},
    {"slug": "mercado", "titulo": "Estudio de Mercado y Tendencias", "ruta": "/vista/mercado", "publica": False},
    {"slug": "locucion", "titulo": "Locución y Doblaje", "ruta": "/vista/locucion", "publica": False},
    {"slug": "facturas", "titulo": "Facturas y Gestoría Trimestral", "ruta": "/vista/facturas", "publica": False},
    {"slug": "correos", "titulo": "Correos de Soporte de Usuarios", "ruta": "/vista/correos", "publica": False},
    {"slug": "pnl", "titulo": "Programación Neurolingüística (PNL)", "ruta": "/vista/pnl", "publica": False},
    {"slug": "herramientas", "titulo": "Catálogo de Herramientas", "ruta": "/vista/herramientas", "publica": False},
    {"slug": "auditor-tiendas", "titulo": "Auditoría de Tiendas y Versiones", "ruta": "/vista/auditor-tiendas", "publica": False},
    {"slug": "auditoria-web", "titulo": "Auditoría Web y Conversión", "ruta": "/vista/auditoria-web", "publica": False},
    {"slug": "admob", "titulo": "AdMob y Publicidad Dual", "ruta": "/vista/admob", "publica": False},
    {"slug": "aislar-voces", "titulo": "Aislamiento Vocal y Peritaje", "ruta": "/vista/aislar-voces", "publica": False},
    {"slug": "campana-visual", "titulo": "Campaña Visual Multiformato", "ruta": "/vista/campana-visual", "publica": False},
    {"slug": "edicion-video", "titulo": "Edición y Mezcla de Vídeo", "ruta": "/vista/edicion-video", "publica": False},
    {"slug": "presentaciones", "titulo": "Presentaciones Multilingües", "ruta": "/vista/presentaciones", "publica": False},
    {"slug": "blogger", "titulo": "Publicaciones en Blogger", "ruta": "/vista/blogger", "publica": False},
    {"slug": "conciliacion", "titulo": "Conciliación Bancaria", "ruta": "/vista/conciliacion", "publica": False},
    {"slug": "ses-hospedajes", "titulo": "Registro SES Hospedajes", "ruta": "/vista/ses-hospedajes", "publica": False},
    {"slug": "vps", "titulo": "Estado de Infraestructura VPS", "ruta": "/vista/vps", "publica": False},
    {"slug": "apliarte-bot", "titulo": "Supervisión de ApliArteBot", "ruta": "/vista/apliarte-bot", "publica": False},
    {"slug": "directo", "titulo": "Monitor de Directo y Streaming", "ruta": "/vista/directo", "publica": False},
]


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

    def responder_js(self, js_texto: str, codigo: int = 200):
        cuerpo = js_texto.encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/javascript; charset=utf-8")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("X-Modo-Oficina", "solo_lectura")
        self.end_headers()
        self.wfile.write(cuerpo)

    def responder_svg(self, svg_texto: str, codigo: int = 200):
        cuerpo = svg_texto.encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "image/svg+xml")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("X-Modo-Oficina", "solo_lectura")
        self.end_headers()
        self.wfile.write(cuerpo)

    def responder_error(self, mensaje: str, codigo: int = 404):
        if codigo == 405:
            cuerpo = json.dumps({"error": mensaje, "codigo": codigo}, ensure_ascii=False, indent=2).encode("utf-8")
            self.send_response(codigo)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(cuerpo)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Allow", "GET, OPTIONS")
            self.send_header("X-Modo-Oficina", "solo_lectura")
            self.end_headers()
            self.wfile.write(cuerpo)
            return
        self.responder_json({"error": mensaje, "codigo": codigo}, codigo=codigo)

    def do_GET(self):
        parsed = urlparse(self.path)
        ruta = parsed.path.rstrip("/")

        if ruta == "/favicon.svg":
            archivo_fav = RAIZ_PROYECTO / "favicon.svg"
            if archivo_fav.exists():
                self.responder_svg(archivo_fav.read_text(encoding="utf-8"))
                return

        if ruta == "/manifest.json":
            archivo_man = RAIZ_PROYECTO / "manifest.json"
            if archivo_man.exists():
                self.responder_json(json.loads(archivo_man.read_text(encoding="utf-8")))
                return

        if ruta in ("/vistas/escaparate.js", "/escaparate.js"):
            archivo_js = DIR_VISTAS / "escaparate.js"
            if archivo_js.exists():
                self.responder_js(archivo_js.read_text(encoding="utf-8"))
                return

        if ruta in ("", "/", "/index.html"):
            archivo_index = RAIZ_PROYECTO / "index.html"
            if archivo_index.exists():
                self.responder_html(archivo_index.read_text(encoding="utf-8"))
                return

        if ruta in ("/vista/skills", "/skills", "/vistas/skills.html"):
            archivo_vista = DIR_VISTAS / "skills.html"
            if archivo_vista.exists():
                self.responder_html(archivo_vista.read_text(encoding="utf-8"))
                return

        if ruta in ("/resenas", "/vista/resenas", "/vistas/resenas.html"):
            archivo_vista = DIR_VISTAS / "resenas.html"
            if archivo_vista.exists():
                self.responder_html(archivo_vista.read_text(encoding="utf-8"))
                return

        if ruta in ("/vista/instala-tu-oficina", "/instala-tu-oficina", "/vistas/instala-tu-oficina.html"):
            archivo_vista = DIR_VISTAS / "instala-tu-oficina.html"
            if archivo_vista.exists():
                self.responder_html(archivo_vista.read_text(encoding="utf-8"))
                return

        if ruta.startswith("/datos/"):
            archivo_dato = RAIZ_PROYECTO / ruta.lstrip("/")
            if archivo_dato.exists() and archivo_dato.is_file() and archivo_dato.suffix == ".json":
                try:
                    datos = json.loads(archivo_dato.read_text(encoding="utf-8"))
                    self.responder_json(datos)
                    return
                except Exception:
                    pass

        if ruta == "/api/estado":
            self.responder_json({
                "servicio": "oficina-apliarte",
                "estado": "activo",
                "modo": "solo_lectura",
                "version": "0.1.0",
                "total_habilidades": len(listar_habilidades()),
                "total_resenas": len(listar_resenas()),
                "total_pestanas": len(PESTANAS_ECOSISTEMA),
                "pestanas_publicas": sum(1 for p in PESTANAS_ECOSISTEMA if p["publica"]),
            })
            return

        if ruta == "/api/pestanas":
            self.responder_json({
                "modo": "solo_lectura",
                "total": len(PESTANAS_ECOSISTEMA),
                "pestanas": PESTANAS_ECOSISTEMA,
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

        if ruta.startswith("/vista/"):
            slug = ruta.replace("/vista/", "").strip("/")
            for p in PESTANAS_ECOSISTEMA:
                if p["slug"] == slug:
                    plantilla_privada = DIR_VISTAS / "pestana_privada.html"
                    if plantilla_privada.exists():
                        contenido = plantilla_privada.read_text(encoding="utf-8")
                        contenido = contenido.replace("{{TITULO_PESTANA}}", p["titulo"])
                        self.responder_html(contenido)
                        return
                    break

        self.responder_error(f"Ruta '{ruta}' no encontrada en modo solo lectura", 404)

    def do_POST(self):
        self.responder_error("Metodo POST bloqueado: servidor en modo exclusivo de solo lectura", 405)

    def do_PUT(self):
        self.responder_error("Metodo PUT bloqueado: servidor en modo exclusivo de solo lectura", 405)

    def do_DELETE(self):
        self.responder_error("Metodo DELETE bloqueado: servidor en modo exclusivo de solo lectura", 405)

    def do_PATCH(self):
        self.responder_error("Metodo PATCH bloqueado: servidor en modo exclusivo de solo lectura", 405)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("X-Modo-Oficina", "solo_lectura")
        self.end_headers()

    def log_message(self, format, *args):
        # Silenciar logs en consola estandar salvo errores criticos
        pass


def arrancar_servidor(puerto: int = 8791, host: str = "0.0.0.0"):
    servidor = HTTPServer((host, puerto), ManejadorOficina)
    print(f"Servidor Oficina ApliArte escuchando en http://{host}:{puerto} (solo lectura)")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        servidor.server_close()
        print("\nServidor detenido de forma limpia.")


if __name__ == "__main__":
    puerto_env = int(os.environ.get("OFICINA_PUERTO", "8791"))
    host_env = os.environ.get("OFICINA_HOST", "0.0.0.0")
    arrancar_servidor(puerto=puerto_env, host=host_env)
