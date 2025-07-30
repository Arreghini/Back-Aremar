import json
import requests
import sys
import os
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
    
    fechas = [item['date'] for item in data]
    vendidos = [item['sold'] for item in data]
    no_vendidos = [item['unsold'] for item in data]
    
    ancho = 1300
    alto = 700
    margen = {'top': 50, 'right': 50, 'bottom': 100, 'left': 100}
    area_grafico_ancho = ancho - margen['left'] - margen['right']
    area_grafico_alto = alto - margen['top'] - margen['bottom']
    
    max_total = max([v + nv for v, nv in zip(vendidos, no_vendidos)] + [1])  # Evita división por cero
    
    ancho_barra = area_grafico_ancho / len(fechas) * 0.8
    espacio_barra = area_grafico_ancho / len(fechas)
    
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{ancho}" height="{alto}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .titulo {{ font: bold 16px Arial; text-anchor: middle; fill: #333; }}
            .etiqueta-eje {{ font: 12px Arial; text-anchor: middle; fill: #666; }}
            .etiqueta-y {{ font: 12px Arial; text-anchor: end; fill: #666; }}
            .leyenda {{ font: 12px Arial; fill: #333; }}
            .grilla {{ stroke: #e0e0e0; stroke-width: 1; }}
        </style>
    </defs>
    
    <rect width="{ancho}" height="{alto}" fill="white"/>
    
    <text x="{ancho/2}" y="30" class="titulo">Análisis de Ingresos Diarios</text>
'''

    # Líneas de grilla horizontal y etiquetas Y
    for i in range(6):
        y = margen['top'] + (area_grafico_alto * i / 5)
        valor = max_total * (5 - i) / 5
        svg += f'<line x1="{margen["left"]}" y1="{y}" x2="{margen["left"] + area_grafico_ancho}" y2="{y}" class="grilla"/>\n'
        svg += f'<text x="{margen["left"] - 10}" y="{y + 4}" class="etiqueta-y">${valor:,.0f}</text>\n'

    # Barras apiladas: vendido abajo (verde), no_vendido encima (rojo)
    for i, (fecha, vendido, no_vendido) in enumerate(zip(fechas, vendidos, no_vendidos)):
        x = margen['left'] + (i * espacio_barra) + (espacio_barra - ancho_barra) / 2

        altura_vendido = (vendido / max_total) * area_grafico_alto
        altura_no_vendido = (no_vendido / max_total) * area_grafico_alto

        # Posiciones para barras apiladas: vendido abajo, no_vendido encima
        y_vendido = margen['top'] + area_grafico_alto - altura_vendido
        y_no_vendido = y_vendido - altura_no_vendido

        # Barra vendido (verde) en la base
        if altura_vendido > 0:
            svg += f'<rect x="{x}" y="{y_vendido}" width="{ancho_barra}" height="{altura_vendido}" style="fill:#2E8B57; opacity:1; stroke:#000; stroke-width:1"/>\n'

        # Barra no vendido (roja) encima del vendido
        if altura_no_vendido > 0:
            svg += f'<rect x="{x}" y="{y_no_vendido}" width="{ancho_barra}" height="{altura_no_vendido}" style="fill:#FF0000; opacity:1; stroke:#000; stroke-width:1"/>\n'

        # Etiqueta de fecha (rotada)
        fecha_corta = fecha[5:10] if len(fecha) >= 10 else fecha
        text_x = x + ancho_barra / 2
        text_y = margen['top'] + area_grafico_alto + 20
        svg += f'<text x="{text_x}" y="{text_y}" class="etiqueta-eje" transform="rotate(45, {text_x}, {text_y})">{fecha_corta}</text>\n'
    
    leyenda_x = margen['left'] + 20
    leyenda_y = margen['top'] + 20
    
    svg += f'''
    <rect x="{leyenda_x}" y="{leyenda_y}" width="15" height="15" style="fill:#2E8B57; opacity:0.8"/>
    <text x="{leyenda_x + 20}" y="{leyenda_y + 12}" class="leyenda">Ingresos Generados</text>
    <rect x="{leyenda_x}" y="{leyenda_y + 25}" width="15" height="15" style="fill:#DC143C; opacity:1"/>
    <text x="{leyenda_x + 20}" y="{leyenda_y + 37}" class="leyenda">Potencial No Aprovechado</text>
    <text x="{ancho/2}" y="{alto - 10}" class="etiqueta-eje">Fecha</text>
    <text x="20" y="{alto/2}" class="etiqueta-eje" transform="rotate(-90, 20, {alto/2})">Ingresos Totales (ARS)</text>
</svg>
'''

    try:
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(svg)
        return output_filename
    except Exception as e:
        raise Exception(f"Error al guardar el archivo SVG: {e}")

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

        # Convertir SVG a PNG con cairosvg
        png_filename = filename.replace(".svg", ".png")
        cairosvg.svg2png(url=filename, write_to=png_filename)
        print(f"SUCCESS_PNG:{png_filename}")

    except Exception as e:
        print(f"ERROR:{e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
