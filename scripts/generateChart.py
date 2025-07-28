import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import requests

# Configurar parámetros
API_URL = "http://localhost:3000/excel/analytics"
START_DATE = "2024-07-01"
END_DATE = "2024-07-15"

# Parámetros de consulta
params = {
    "startDate": START_DATE,
    "endDate": END_DATE
}

# Obtener los datos del backend
response = requests.get(API_URL, params=params)

if response.status_code != 200:
    raise Exception(f"Error al obtener los datos: {response.status_code}")

data = response.json()

# Transformar en DataFrame
df = pd.DataFrame(data)
df['date'] = pd.to_datetime(df['date'])

# Graficar
plt.figure(figsize=(10, 6))
sns.set_style("whitegrid")

plt.bar(df['date'], df['sold'], label='Vendido', color='green')
plt.bar(df['date'], df['unsold'], bottom=df['sold'], label='No vendido', color='red')

plt.title("Ingresos por día (vendido vs no vendido)")
plt.xlabel("Fecha")
plt.ylabel("Monto en pesos")
plt.xticks(rotation=45)
plt.legend()
plt.tight_layout()

# Guardar imagen
plt.savefig("grafico_ingresos.png")
plt.show()
