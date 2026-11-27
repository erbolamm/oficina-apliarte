#!/usr/bin/env python3
"""
servidor_oficina.py — Servidor HTTP ligero y soberano de Oficina ApliArte.
Modo de solo lectura para consulta y descarga de habilidades y metadatos.
"""

import html
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
    {"slug": "oficina", "titulo": "Oficina", "subtitulo": "Tablero de tareas", "ruta": "/vista/tareas", "publica": True, "activa": True, "icono": "⌂"},
    {"slug": "propuestas", "titulo": "Propuestas", "subtitulo": "Bandeja comunitaria", "ruta": "/vista/propuestas", "publica": True, "activa": True, "icono": "💡"},
    {"slug": "aplicaciones", "titulo": "Aplicaciones", "subtitulo": "Catálogo oficial", "ruta": "/vista/aplicaciones", "publica": True, "activa": True, "icono": "📱"},
    {"slug": "paquetes", "titulo": "Paquetes", "subtitulo": "Librerías Flutter", "ruta": "/vista/paquetes", "publica": True, "activa": True, "icono": "📦"},
    {"slug": "skills", "titulo": "Skills", "subtitulo": "Botonera y catálogo", "ruta": "/vista/skills", "publica": True, "activa": True, "icono": "⌘"},
    {"slug": "verticales", "titulo": "Verticales", "subtitulo": "Módulos desacoplados", "ruta": "/vista/verticales", "publica": True, "activa": True, "icono": "▦"},
    {"slug": "agentes", "titulo": "Agentes", "subtitulo": "Fichas de agentes", "ruta": "/vista/agentes", "publica": True, "activa": True, "icono": "🤖"},
    {"slug": "como-funciona", "titulo": "Cómo funciona", "subtitulo": "Guía de la Oficina", "ruta": "/vista/como-funciona", "publica": True, "activa": True, "icono": "?"},
    {"slug": "herdr", "titulo": "Herdr", "subtitulo": "Consola móvil", "ruta": "/vista/herdr", "publica": True, "activa": True, "icono": "⚡"},
    {"slug": "radar", "titulo": "Radar", "subtitulo": "Multi-agente", "ruta": "/vista/radar", "publica": True, "activa": True, "icono": "📡"},
    {"slug": "visita-guiada", "titulo": "Visita Guiada", "subtitulo": "Tour interactivo", "ruta": "/vista/visita-guiada", "publica": True, "activa": True, "icono": "🗺️"},
    {"slug": "seo", "titulo": "Espacio SEO", "subtitulo": "Auditoría, posicionamiento y metadatos", "ruta": "/vista/seo", "publica": False, "activa": False, "icono": "🔍"},
    {"slug": "inicio-dia", "titulo": "Inicio del día", "subtitulo": "Checklist matutino", "ruta": "/vista/inicio-dia", "publica": False, "activa": False, "icono": "☼"},
    {"slug": "aplichat", "titulo": "ApliChat", "subtitulo": "Chat accesible", "ruta": "/vista/aplichat", "publica": False, "activa": False, "icono": "💬"},
    {"slug": "conectores", "titulo": "Conectores", "subtitulo": "Servicios y credenciales", "ruta": "/vista/conectores", "publica": False, "activa": False, "icono": "⇄"},
    {"slug": "plugins", "titulo": "Plugins", "subtitulo": "Módulos de la Oficina", "ruta": "/vista/plugins", "publica": False, "activa": False, "icono": "⊞"},
    {"slug": "reflect", "titulo": "Reflect", "subtitulo": "Directivas y memoria", "ruta": "/vista/reflect", "publica": False, "activa": False, "icono": "◐"},
    {"slug": "diseno", "titulo": "Estudio de Diseño", "subtitulo": "Vídeo, marcos y SFX", "ruta": "/vista/diseno", "publica": False, "activa": False, "icono": "🎨"},
    {"slug": "tiendas", "titulo": "Tiendas y ASO", "subtitulo": "Auditoría y keywords", "ruta": "/vista/tiendas", "publica": False, "activa": False, "icono": "🎯"},
    {"slug": "mercado", "titulo": "Radar de Mercado", "subtitulo": "Tendencias y noticias", "ruta": "/vista/mercado", "publica": False, "activa": False, "icono": "📊"},
    {"slug": "correos", "titulo": "Correos y Alertas", "subtitulo": "erbolamm y javier", "ruta": "/vista/correos", "publica": False, "activa": False, "icono": "✉"},
    {"slug": "pnl", "titulo": "Estudio PNL", "subtitulo": "Enganche y microcopy", "ruta": "/vista/pnl", "publica": False, "activa": False, "icono": "🧠"},
    {"slug": "musica", "titulo": "Estudio Musical", "subtitulo": "Música procedural", "ruta": "/vista/musica", "publica": False, "activa": False, "icono": "🎵"},
    {"slug": "locucion", "titulo": "Locución y Guiones", "subtitulo": "TTS y guiones cortos", "ruta": "/vista/locucion", "publica": False, "activa": False, "icono": "🎙"},
    {"slug": "voicestudio", "titulo": "Voces ApliArte", "subtitulo": "Clonación ultrarrápida", "ruta": "/vista/voicestudio", "publica": False, "activa": False, "icono": "⚡"},
    {"slug": "terminales", "titulo": "Terminales", "subtitulo": "Lanzadores locales", "ruta": "/vista/terminales", "publica": False, "activa": False, "icono": "▣"},
    {"slug": "facturas", "titulo": "Facturas", "subtitulo": "Gestor de facturas", "ruta": "/vista/facturas", "publica": False, "activa": False, "icono": "€"},
    {"slug": "blogger", "titulo": "Blogger", "subtitulo": "Monitor y difusión", "ruta": "/vista/blogger", "publica": False, "activa": False, "icono": "✎"},
    {"slug": "bitacora", "titulo": "Bitácora", "subtitulo": "Proyectos y enlaces", "ruta": "/vista/bitacora", "publica": False, "activa": False, "icono": "☰"},
    {"slug": "directo", "titulo": "Directo", "subtitulo": "Centro de retransmisión", "ruta": "/vista/directo", "publica": True, "activa": True, "icono": "▶"},
    {"slug": "diapositivas", "titulo": "Diapositivas", "subtitulo": "Presentaciones y difusión", "ruta": "/vista/diapositivas", "publica": False, "activa": False, "icono": "⎘"},
    {"slug": "shorts", "titulo": "Shorts", "subtitulo": "Vídeo acelerado a 60 s", "ruta": "/vista/shorts", "publica": False, "activa": False, "icono": "⏩"},
    {"slug": "resenas", "titulo": "Reseñas", "subtitulo": "Contestador inteligente", "ruta": "/vista/resenas", "publica": False, "activa": False, "icono": "★"}
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

    def responder_css(self, css_texto: str, codigo: int = 200):
        cuerpo = css_texto.encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "text/css; charset=utf-8")
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

    def responder_binario(self, cuerpo: bytes, tipo_contenido: str, codigo: int = 200):
        self.send_response(codigo)
        self.send_header("Content-Type", tipo_contenido)
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("Cache-Control", "public, max-age=604800")
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

        if ruta in ("/en-construccion.svg", "/vista/en-construccion.svg"):
            archivo_construccion = RAIZ_PROYECTO / "vistas" / "en-construccion.svg"
            if archivo_construccion.exists():
                self.responder_svg(archivo_construccion.read_text(encoding="utf-8"))
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

        if ruta == "/panel-shell.css":
            archivo_css = RAIZ_PROYECTO / "panel-shell.css"
            if archivo_css.exists():
                self.responder_css(archivo_css.read_text(encoding="utf-8"))
                return

        if ruta in ("/construccion.css", "/vista/construccion.css"):
            archivo_css = DIR_VISTAS / "construccion.css"
            if archivo_css.exists():
                self.responder_css(archivo_css.read_text(encoding="utf-8"))
                return

        if ruta in ("/construccion.js", "/vista/construccion.js"):
            archivo_js = DIR_VISTAS / "construccion.js"
            if archivo_js.exists():
                self.responder_js(archivo_js.read_text(encoding="utf-8"))
                return


        if ruta == "/panel-shell.js":
            archivo_js = RAIZ_PROYECTO / "panel-shell.js"
            if archivo_js.exists():
                self.responder_js(archivo_js.read_text(encoding="utf-8"))
                return

        if ruta in ("/tareas/oficina-modulos.json", "/api/como-funciona"):
            archivo_json = RAIZ_PROYECTO / "datos/oficina-modulos.json"
            if archivo_json.exists():
                try:
                    datos = json.loads(archivo_json.read_text(encoding="utf-8"))
                    self.responder_json(datos)
                except json.JSONDecodeError:
                    self.responder_error("Error al leer oficina-modulos.json", 500)
                return

        if ruta == "/images/abyss.jpg":
            self.responder_svg('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#0b1116"/></svg>')
            return

        if ruta.startswith("/componentes/") and ruta.endswith(".js"):
            raiz_comp = (RAIZ_PROYECTO / "componentes").resolve()
            archivo_js = (RAIZ_PROYECTO / ruta.lstrip("/")).resolve()
            if archivo_js.is_relative_to(raiz_comp) and archivo_js.exists() and archivo_js.is_file():
                self.responder_js(archivo_js.read_text(encoding="utf-8"))
                return

        if ruta.startswith("/estilos/") and ruta.endswith(".css"):
            raiz_est = (RAIZ_PROYECTO / "estilos").resolve()
            archivo_css = (RAIZ_PROYECTO / ruta.lstrip("/")).resolve()
            if archivo_css.is_relative_to(raiz_est) and archivo_css.exists() and archivo_css.is_file():
                self.responder_css(archivo_css.read_text(encoding="utf-8"))
                return

        if ruta.startswith("/assets/"):
            raiz_assets = (RAIZ_PROYECTO / "assets").resolve()
            archivo_asset = (RAIZ_PROYECTO / ruta.lstrip("/")).resolve()
            tipos_assets = {
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".webp": "image/webp",
                ".gif": "image/gif",
                ".svg": "image/svg+xml",
            }
            tipo_asset = tipos_assets.get(archivo_asset.suffix.lower())
            if (
                tipo_asset
                and archivo_asset.is_relative_to(raiz_assets)
                and archivo_asset.exists()
                and archivo_asset.is_file()
            ):
                self.responder_binario(archivo_asset.read_bytes(), tipo_asset)
                return

        if ruta in ("", "/", "/index.html"):
            archivo_index = RAIZ_PROYECTO / "index.html"
            if archivo_index.exists():
                self.responder_html(archivo_index.read_text(encoding="utf-8"))
                return

        if ruta.startswith("/datos/"):
            raiz_datos = DIR_DATOS.resolve()
            archivo_dato = (RAIZ_PROYECTO / ruta.lstrip("/")).resolve()
            if archivo_dato.is_relative_to(raiz_datos) and archivo_dato.exists() and archivo_dato.is_file() and archivo_dato.suffix == ".json":
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

        if ruta == "/api/tareas":
            archivo_tar = DIR_DATOS / "tareas.json"
            if archivo_tar.exists():
                self.responder_json(json.loads(archivo_tar.read_text(encoding="utf-8")))
            else:
                self.responder_json([])
            return

        if ruta == "/api/propuestas":
            archivo_prop = DIR_DATOS / "propuestas.json"
            if archivo_prop.exists():
                self.responder_json(json.loads(archivo_prop.read_text(encoding="utf-8")))
            else:
                self.responder_json([])
            return

        if ruta == "/api/aplicaciones":
            archivo_app = DIR_DATOS / "aplicaciones.json"
            if archivo_app.exists():
                self.responder_json(json.loads(archivo_app.read_text(encoding="utf-8")))
            else:
                self.responder_json([])
            return

        if ruta == "/api/paquetes":
            archivo_paq = DIR_DATOS / "paquetes.json"
            if archivo_paq.exists():
                self.responder_json(json.loads(archivo_paq.read_text(encoding="utf-8")))
            else:
                self.responder_json([])
            return

        if ruta == "/api/verticales":
            archivo_vert = DIR_DATOS / "verticales.json"
            if archivo_vert.exists():
                self.responder_json(json.loads(archivo_vert.read_text(encoding="utf-8")))
            else:
                self.responder_json([])
            return

        if ruta in ("/api/borradores-camino-rojo", "/api/camino-rojo"):
            archivo_borr = DIR_DATOS / "borradores-camino-rojo.json"
            if archivo_borr.exists():
                self.responder_json(json.loads(archivo_borr.read_text(encoding="utf-8")))
            else:
                self.responder_json([])
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

        if ruta == "/resenas":
            ruta = "/vista/resenas"

        if ruta.startswith("/vista/"):
            slug = ruta.replace("/vista/", "").strip("/")
            if slug in ("tareas", "tablero"):
                index_file = RAIZ_PROYECTO / "index.html"
                if index_file.exists():
                    contenido_index = (
                        index_file.read_text(encoding="utf-8")
                        .replace('href="favicon.svg"', 'href="/favicon.svg"')
                        .replace('href="manifest.json"', 'href="/manifest.json"')
                        .replace('href="panel-shell.css', 'href="/panel-shell.css')
                        .replace('src="panel-shell.js', 'src="/panel-shell.js')
                    )
                    self.responder_html(contenido_index)
                    return
            raiz_vistas = DIR_VISTAS.resolve()
            archivo_vista = (DIR_VISTAS / f"{slug}.html").resolve()
            if archivo_vista.is_relative_to(raiz_vistas) and archivo_vista.exists() and archivo_vista.name != "pestana_privada.html":
                contenido = archivo_vista.read_text(encoding="utf-8")
                self.responder_html(contenido)
                return
            for p in PESTANAS_ECOSISTEMA:
                if p["slug"] == slug:
                    plantilla = (DIR_VISTAS / "construccion.html").read_text(encoding="utf-8")
                    contenido = (plantilla
                        .replace("{{TITULO}}", html.escape(p["titulo"]))
                        .replace("{{SUBTITULO}}", html.escape(p["subtitulo"]))
                        .replace("{{SLUG}}", html.escape(slug)))
                    self.responder_html(contenido)
                    return
            vistas_apoyo = {
                "settings": ("Ajustes", "Opciones por defecto"),
                "manual": ("Manual", "Guía de uso y arquitectura"),
                "buzon": ("Buzón de ideas", "Ideas y recordatorios"),
                "informes": ("Informes", "Resumen y auditoría operativa"),
            }
            if slug in vistas_apoyo:
                titulo, subtitulo = vistas_apoyo[slug]
                plantilla = (DIR_VISTAS / "construccion.html").read_text(encoding="utf-8")
                contenido = (plantilla
                    .replace("{{TITULO}}", html.escape(titulo))
                    .replace("{{SUBTITULO}}", html.escape(subtitulo))
                    .replace("{{SLUG}}", html.escape(slug)))
                self.responder_html(contenido)
                return
        elif ruta.startswith("/vistas/"):
            slug = ruta.replace("/vistas/", "").strip("/")
            raiz_vistas = DIR_VISTAS.resolve()
            archivo_vista = (DIR_VISTAS / f"{slug}.html").resolve()
            if archivo_vista.is_relative_to(raiz_vistas) and archivo_vista.exists() and archivo_vista.is_file():
                contenido = archivo_vista.read_text(encoding="utf-8")
                self.responder_html(contenido)
                return

        self.responder_error(f"Ruta '{ruta}' no encontrada en modo solo lectura", 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        ruta = parsed.path.rstrip("/")

        if ruta in ("/api/propuestas", "/api/tareas"):
            accion_hdr = (self.headers.get("X-ErBolamm-Action") or "").strip()
            if not accion_hdr:
                self.responder_error("Cabecera X-ErBolamm-Action requerida", 403)
                return
            try:
                longitud = int(self.headers.get("Content-Length", 0))
            except (ValueError, TypeError):
                longitud = 0

            if longitud <= 0:
                self.responder_error("Cuerpo de peticion vacio", 400)
                return
            try:
                cuerpo = self.rfile.read(longitud).decode("utf-8")
                datos = json.loads(cuerpo)
            except Exception as e:
                self.responder_error(f"Error decodificando JSON: {str(e)}", 400)
                return

            campos_obligatorios = ["id", "titulo", "descripcion", "categoria", "estado", "autor", "fecha"]
            for campo in campos_obligatorios:
                if campo not in datos or not str(datos[campo]).strip():
                    self.responder_error(f"Campo obligatorio '{campo}' ausente o vacio", 400)
                    return

            if len(str(datos["descripcion"])) > 800:
                self.responder_error("La descripcion supera el limite maximo de 800 caracteres", 400)
                return

            archivo_destino = DIR_DATOS / ("propuestas.json" if ruta == "/api/propuestas" else "tareas.json")
            elementos = []
            if archivo_destino.exists():
                try:
                    elementos = json.loads(archivo_destino.read_text(encoding="utf-8"))
                    if not isinstance(elementos, list):
                        elementos = []
                except Exception:
                    elementos = []

            elementos.insert(0, datos)
            archivo_destino.write_text(json.dumps(elementos, ensure_ascii=False, indent=2), encoding="utf-8")
            self.responder_json({"ok": True, "mensaje": "Elemento registrado exitosamente", "elemento": datos}, codigo=201)
            return

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
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("X-Modo-Oficina", "solo_lectura")
        self.end_headers()

    def log_message(self, format, *args):
        # Silenciar logs en consola estandar salvo errores criticos
        pass


def arrancar_servidor(puerto: int = 8795, host: str = "0.0.0.0"):
    servidor = HTTPServer((host, puerto), ManejadorOficina)
    print(f"Servidor Oficina ApliArte escuchando en http://{host}:{puerto} (solo lectura)")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        servidor.server_close()
        print("\nServidor detenido de forma limpia.")


if __name__ == "__main__":
    puerto_env = int(os.environ.get("OFICINA_PUERTO", "8795"))
    host_env = os.environ.get("OFICINA_HOST", "0.0.0.0")
    arrancar_servidor(puerto=puerto_env, host=host_env)
