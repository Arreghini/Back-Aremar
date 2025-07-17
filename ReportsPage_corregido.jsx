import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const ReportsPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDownload = async () => {
    const token = await getAccessTokenSilently();
    try {
      // Construir la URL con los parámetros de fecha
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      // URL corregida para que coincida con la ruta del backend
      const response = await fetch(`http://localhost:3000/api/admin/export/excel/analytics?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Usar un nombre más descriptivo basado en las fechas
      const filename = startDate && endDate 
        ? `analytics_${startDate}_al_${endDate}.xlsx`
        : 'analytics_report.xlsx';
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Limpiar el objeto URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Fallo en la descarga:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Reportes y Análisis</h1>

      <div className="mb-4">
        <div className="flex gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha inicio:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha fin:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Descargar Reporte Excel
      </button>
    </div>
  );
};

export default ReportsPage;
