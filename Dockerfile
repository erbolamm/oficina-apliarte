# Dockerfile ligero y soberano para Oficina ApliArte
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    OFICINA_PUERTO=8791 \
    OFICINA_HOST=0.0.0.0

WORKDIR /app

# Copia de codigo soberano
COPY . /app

# Usuario sin privilegios por seguridad
RUN useradd -u 1000 -m -s /bin/sh appuser && chown -R appuser:appuser /app
USER appuser

# Puerto oficial de Oficina ApliArte
EXPOSE 8791

# Volumen persistente para datos y estado
VOLUME ["/app/resenas", "/app/habilidades"]

# Comprobacion de salud nativa en Python sin herramientas externas
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8791/api/estado')" || exit 1

CMD ["python3", "servidor/servidor_oficina.py"]
