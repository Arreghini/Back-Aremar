import json
import requests
import sys
import os
from datetime import datetime
import cairosvg

API_URL = "http://localhost:3000/api/admin/export/excel/analytics/json"

def obtener_datos(start_date, end_date, auth_token):
    params = {
        "startDate": start_date,
        "endDate": end_date
    }
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.get(API_URL, params=params, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise Exception(f"Error al obtener los datos: {e}")

def crear_grafico_svg(data, output_filename="grafico_ingresos.svg"):
    """Crear un gráfico SVG simple sin dependencias externas"""
    if not data:
        raise ValueError("No hay datos para generar el gráfico")
    
    # Extraer datos
    fechas = [item['date'] for item in data]
    vendidos = [item['sold'] for item in data]
    no_vendidos = [item['unsold'] for item in data]
    
    # Configuraciones del gráfico
    ancho = 800
    alto = 500
    margen = {'top': 50, 'right': 50, 'bottom': 100, 'left': 100}
    area_grafico_ancho = ancho - margen['left'] - margen['right']
    area_grafico_alto = alto - margen['top'] - margen['bottom']
    
    # Calcular valores máximos
    max_vendido = max(vendidos) if vendidos else 0
    max_total = max([v + nv for v, nv in zip(vendidos, no_vendidos)]) if vendidos else 0
    max_valor = max(max_total, 1)  # Evitar división por cero
    
    # Ancho de cada barra
    ancho_barra = area_grafico_ancho / len(fechas) * 0.8
    espacio_barra = area_grafico_ancho / len(fechas)
    
    # Crear SVG
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{ancho}" height="{alto}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .titulo {{ font: bold 16px Arial; text-anchor: middle; fill: #333; }}
            .etiqueta-eje {{ font: 12px Arial; text-anchor: middle; fill: #666; }}
            .etiqueta-y {{ font: 12px Arial; text-anchor: end; fill: #666; }}
            .leyenda {{ font: 12px Arial; fill: #333; }}
            .grilla {{ stroke: #e0e0e0; stroke-width: 1; }}
            .vendido {{ fill: #2E8B57; opacity: 0.8; }}
            .no-vendido {{ fill: #DC143C; opacity: 0.8; }}
        </style>
    </defs>
    
    <!-- Fondo -->
    <rect width="{ancho}" height="{alto}" fill="white"/>
    
    <!-- Título -->
    <text x="{ancho/2}" y="30" class="titulo">Análisis de Ingresos Diarios</text>
    
    <!-- Grilla horizontal -->'''
    
    # Agregar líneas de grilla
    for i in range(6):
        y = margen['top'] + (area_grafico_alto * i / 5)
        valor = max_valor * (5 - i) / 5
        svg += f'\n    <line x1="{margen["left"]}" y1="{y}" x2="{margen["left"] + area_grafico_ancho}" y2="{y}" class="grilla"/>'
        svg += f'\n    <text x="{margen["left"] - 10}" y="{y + 4}" class="etiqueta-y">${valor:,.0f}</text>'
    
    # Agregar barras
    for i, (fecha, vendido, no_vendido) in enumerate(zip(fechas, vendidos, no_vendidos)):
        x = margen['left'] + (i * espacio_barra) + (espacio_barra - ancho_barra) / 2
        
        # Altura de las barras (proporcional al valor máximo)
        altura_vendido = (vendido / max_valor) * area_grafico_alto if max_valor > 0 else 0
        altura_no_vendido = (no_vendido / max_valor) * area_grafico_alto if max_valor > 0 else 0
        
        # Posición Y (invertida porque SVG tiene origen arriba)
        y_vendido = margen['top'] + area_grafico_alto - altura_vendido
        y_no_vendido = y_vendido - altura_no_vendido
        
        # Barra vendido (abajo)
        svg += f'\n    <rect x="{x}" y="{y_vendido}" width="{ancho_barra}" height="{altura_vendido}" class="vendido"/>'
        
        # Barra no vendido (arriba)
        if altura_no_vendido > 0:
            svg += f'\n    <rect x="{x}" y="{y_no_vendido}" width="{ancho_barra}" height="{altura_no_vendido}" class="no-vendido"/>'
        
        # Etiqueta de fecha (rotada)
        fecha_corta = fecha[5:10] if len(fecha) >= 10 else fecha  # MM-DD
        text_x = x + ancho_barra / 2
        text_y = margen['top'] + area_grafico_alto + 20
        svg += f'\n    <text x="{text_x}" y="{text_y}" class="etiqueta-eje" transform="rotate(45, {text_x}, {text_y})">{fecha_corta}</text>'
    
    # Leyenda
    leyenda_x = margen['left'] + 20
    leyenda_y = margen['top'] + 20
    
    svg += f'''
    
    <!-- Leyenda -->
    <rect x="{leyenda_x}" y="{leyenda_y}" width="15" height="15" class="vendido"/>
    <text x="{leyenda_x + 20}" y="{leyenda_y + 12}" class="leyenda">Ingresos Generados</text>
    
    <rect x="{leyenda_x}" y="{leyenda_y + 25}" width="15" height="15" class="no-vendido"/>
    <text x="{leyenda_x + 20}" y="{leyenda_y + 37}" class="leyenda">Potencial No Aprovechado</text>
    
    <!-- Etiquetas de ejes -->
    <text x="{ancho/2}" y="{alto - 10}" class="etiqueta-eje">Fecha</text>
    <text x="20" y="{alto/2}" class="etiqueta-eje" transform="rotate(-90, 20, {alto/2})">Monto (ARS)</text>
    
</svg>'''
    
    # Guardar archivo
    try:
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(svg)
        return output_filename
    except Exception as e:
        raise Exception(f"Error al guardar el archivo SVG: {e}")

def generar_grafico_desde_datos(data, output_filename="grafico_ingresos.svg"):
    """Generar gráfico directamente desde datos JSON"""
    return crear_grafico_svg(data, output_filename)

def main():
    if len(sys.argv) < 4:
        print("Uso: python generateChart.py <start_date> <end_date> <auth_token> [output_filename]")
        sys.exit(1)
    
    start_date = sys.argv[1]
    end_date = sys.argv[2]
    auth_token = sys.argv[3]
    output_filename = sys.argv[4] if len(sys.argv) > 4 else "grafico_ingresos.svg"
    
    print(f"Generando gráfico desde {start_date} hasta {end_date}...")

    try:
        datos = obtener_datos(start_date, end_date, auth_token)
        filename = crear_grafico_svg(datos, output_filename)
        print(f"SUCCESS:{filename}")

        # Convertir SVG a PNG
        png_filename = filename.replace(".svg", ".png")
        cairosvg.svg2png(url=filename, write_to=png_filename)
        print(f"SUCCESS_PNG:{png_filename}")

    except Exception as e:
        print(f"ERROR:{e}")
        sys.exit(1)

if __name__ == "__main__":
    main()