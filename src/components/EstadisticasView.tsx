import { useState, useMemo } from 'react';
import { Claim } from '../types';
import { categoryLabels, statusLabels } from '../lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface EstadisticasViewProps {
  claims: Claim[];
}

export function EstadisticasView({ claims }: EstadisticasViewProps) {
  const [vistaTemportal, setVistaTemportal] = useState<'mensual' | 'anual'>('mensual');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [mesSeleccionado, setMesSeleccionado] = useState<string>(new Date().getMonth() + 1 + '');
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>(new Date().getFullYear() + '');

  // Filtrar reclamos según criterios
  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      // Filtrar por categoría
      if (selectedCategory !== 'todas' && claim.categoria !== selectedCategory) {
        return false;
      }

      const fechaReclamo = new Date(claim.fechaCreacion);
      
      // Filtrar por período según vista temporal
      if (vistaTemportal === 'mensual') {
        if (mesSeleccionado && anioSeleccionado) {
          const mesReclamo = fechaReclamo.getMonth() + 1;
          const anioReclamo = fechaReclamo.getFullYear();
          
          if (mesReclamo !== parseInt(mesSeleccionado) || anioReclamo !== parseInt(anioSeleccionado)) {
            return false;
          }
        }
      } else if (vistaTemportal === 'anual') {
        if (anioSeleccionado) {
          const anioReclamo = fechaReclamo.getFullYear();
          if (anioReclamo !== parseInt(anioSeleccionado)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [claims, selectedCategory, vistaTemportal, mesSeleccionado, anioSeleccionado]);

  // Calcular categorías más frecuentes (con datos filtrados)
  const categoryCounts = filteredClaims.reduce((acc, claim) => {
    acc[claim.categoria] = (acc[claim.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts).map(([key, value]) => ({
    name: categoryLabels[key as keyof typeof categoryLabels],
    value,
    cantidad: value
  }));

  // Calcular barrios más afectados (con datos filtrados)
  const barrioCounts = filteredClaims.reduce((acc, claim) => {
    acc[claim.barrio] = (acc[claim.barrio] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barrioData = Object.entries(barrioCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Calcular reclamos por estado (con datos filtrados)
  const statusCounts = filteredClaims.reduce((acc, claim) => {
    acc[claim.estado] = (acc[claim.estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([key, value]) => ({
    name: statusLabels[key as keyof typeof statusLabels],
    cantidad: value
  }));

  // Datos para gráfico temporal
  const temporalData = useMemo(() => {
    if (vistaTemportal === 'mensual' && anioSeleccionado) {
      // Datos por día del mes
      const diasDelMes = new Date(parseInt(anioSeleccionado), parseInt(mesSeleccionado), 0).getDate();
      const datosPorDia: Record<number, number> = {};
      
      filteredClaims.forEach(claim => {
        const fecha = new Date(claim.fechaCreacion);
        const dia = fecha.getDate();
        datosPorDia[dia] = (datosPorDia[dia] || 0) + 1;
      });

      return Array.from({ length: diasDelMes }, (_, i) => ({
        nombre: `Día ${i + 1}`,
        cantidad: datosPorDia[i + 1] || 0
      }));
    } else if (vistaTemportal === 'anual' && anioSeleccionado) {
      // Datos por mes del año
      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const datosPorMes: Record<number, number> = {};
      
      claims.filter(claim => {
        const fecha = new Date(claim.fechaCreacion);
        if (fecha.getFullYear() !== parseInt(anioSeleccionado)) return false;
        if (selectedCategory !== 'todas' && claim.categoria !== selectedCategory) return false;
        return true;
      }).forEach(claim => {
        const fecha = new Date(claim.fechaCreacion);
        const mes = fecha.getMonth();
        datosPorMes[mes] = (datosPorMes[mes] || 0) + 1;
      });

      return mesesNombres.map((nombre, i) => ({
        nombre,
        cantidad: datosPorMes[i] || 0
      }));
    }
    return [];
  }, [vistaTemportal, anioSeleccionado, mesSeleccionado, filteredClaims, claims, selectedCategory]);

  // Función para generar PDF mejorada
  const generarPDF = async () => {
    // Importar jsPDF y html2canvas dinámicamente
    const { jsPDF } = await import('jspdf');
    const html2canvas = await import('html2canvas');
    
    const doc = new jsPDF() as any;
    
    // Título
    doc.setFontSize(18);
    doc.text('Reporte Estadístico de Reclamos', 14, 20);
    doc.setFontSize(12);
    doc.text('Municipalidad de Villa Mercedes - San Luis, Argentina', 14, 28);
    
    // Fecha del reporte
    const fechaHoy = new Date().toLocaleDateString('es-AR');
    doc.setFontSize(10);
    doc.text(`Fecha del reporte: ${fechaHoy}`, 14, 35);
    
    // Filtros aplicados
    let yPos = 45;
    doc.setFontSize(12);
    doc.text('Filtros Aplicados:', 14, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.text(`Vista: ${vistaTemportal === 'mensual' ? 'Mensual' : 'Anual'}`, 14, yPos);
    yPos += 5;
    
    if (vistaTemportal === 'mensual') {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      doc.text(`Período: ${meses[parseInt(mesSeleccionado) - 1]} ${anioSeleccionado}`, 14, yPos);
    } else {
      doc.text(`Año: ${anioSeleccionado}`, 14, yPos);
    }
    yPos += 5;
    
    if (selectedCategory !== 'todas') {
      doc.text(`Categoría: ${categoryLabels[selectedCategory as keyof typeof categoryLabels]}`, 14, yPos);
      yPos += 5;
    }
    
    yPos += 5;
    
    // Resumen estadístico
    doc.setFontSize(12);
    doc.text('Resumen:', 14, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.text(`Total de reclamos en el período: ${filteredClaims.length}`, 14, yPos);
    yPos += 5;
    doc.text(`Pendientes: ${filteredClaims.filter(c => c.estado === 'pendiente').length}`, 14, yPos);
    yPos += 5;
    doc.text(`En Proceso: ${filteredClaims.filter(c => c.estado === 'en_proceso').length}`, 14, yPos);
    yPos += 5;
    doc.text(`Resueltos: ${filteredClaims.filter(c => c.estado === 'resuelto').length}`, 14, yPos);
    yPos += 10;
    
    // Estadísticas por categoría
    if (categoryData.length > 0) {
      doc.setFontSize(12);
      doc.text('Reclamos por Categoría:', 14, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      categoryData.forEach(item => {
        doc.text(`• ${item.name}: ${item.cantidad}`, 14, yPos);
        yPos += 5;
      });
      yPos += 5;
    }
    
    // Estadísticas por barrio
    if (barrioData.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text('Barrios más Afectados:', 14, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      barrioData.forEach(item => {
        doc.text(`• ${item.name}: ${item.value}`, 14, yPos);
        yPos += 5;
      });
    }
    
    // Guardar PDF
    const nombreArchivo = `estadisticas-reclamos-${vistaTemportal}-${anioSeleccionado}${vistaTemportal === 'mensual' ? '-' + mesSeleccionado : ''}.pdf`;
    doc.save(nombreArchivo);
  };

  // Colores para gráficos
  const COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'];

  const getMesNombre = (mes: string) => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[parseInt(mes) - 1];
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg md:text-xl">INFORMACIÓN ESTADÍSTICA</CardTitle>
            <Button 
              onClick={generarPDF}
              className="gap-2 w-full sm:w-auto"
              disabled={filteredClaims.length === 0}
            >
              <Download className="w-4 h-4" />
              Descargar Reporte PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              <h3 className="text-sm md:text-base text-gray-900">Filtros de Información</h3>
            </div>
            
            {/* Selector de Vista Temporal */}
            <div className="mb-4">
              <Label>Período de Análisis</Label>
              <Tabs value={vistaTemportal} onValueChange={(value) => setVistaTemportal(value as 'mensual' | 'anual')} className="mt-2">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="mensual">
                    <Calendar className="w-4 h-4 mr-2" />
                    Mensual
                  </TabsTrigger>
                  <TabsTrigger value="anual">
                    <Calendar className="w-4 h-4 mr-2" />
                    Anual
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {/* Selector de Categoría */}
              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las categorías</SelectItem>
                    <SelectItem value="luminaria">Luminaria</SelectItem>
                    <SelectItem value="bache">Bache</SelectItem>
                    <SelectItem value="maleza">Maleza</SelectItem>
                    <SelectItem value="basura">Basura</SelectItem>
                    <SelectItem value="señalizacion">Señalización</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Selector de Mes (solo si es vista mensual) */}
              {vistaTemportal === 'mensual' && (
                <div>
                  <Label htmlFor="mes">Mes</Label>
                  <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
                    <SelectTrigger id="mes">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Enero</SelectItem>
                      <SelectItem value="2">Febrero</SelectItem>
                      <SelectItem value="3">Marzo</SelectItem>
                      <SelectItem value="4">Abril</SelectItem>
                      <SelectItem value="5">Mayo</SelectItem>
                      <SelectItem value="6">Junio</SelectItem>
                      <SelectItem value="7">Julio</SelectItem>
                      <SelectItem value="8">Agosto</SelectItem>
                      <SelectItem value="9">Septiembre</SelectItem>
                      <SelectItem value="10">Octubre</SelectItem>
                      <SelectItem value="11">Noviembre</SelectItem>
                      <SelectItem value="12">Diciembre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Selector de Año */}
              <div>
                <Label htmlFor="anio">Año</Label>
                <Select value={anioSeleccionado} onValueChange={setAnioSeleccionado}>
                  <SelectTrigger id="anio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white border border-blue-300 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Período seleccionado: </span>
                {vistaTemportal === 'mensual' 
                  ? `${getMesNombre(mesSeleccionado)} ${anioSeleccionado}`
                  : `Año ${anioSeleccionado}`
                }
                {selectedCategory !== 'todas' && (
                  <span> • <span className="font-medium">Categoría:</span> {categoryLabels[selectedCategory as keyof typeof categoryLabels]}</span>
                )}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Mostrando {filteredClaims.length} reclamos
              </p>
            </div>
          </div>

          {/* Resumen estadístico */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <Card>
              <CardContent className="pt-4 md:pt-6">
                <div className="text-center">
                  <p className="text-3xl text-blue-600">{filteredClaims.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Reclamos</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl text-yellow-600">
                    {filteredClaims.filter(c => c.estado === 'pendiente').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Pendientes</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl text-purple-600">
                    {filteredClaims.filter(c => c.estado === 'en_proceso').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">En Proceso</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl text-green-600">
                    {filteredClaims.filter(c => c.estado === 'resuelto').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Resueltos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de evolución temporal */}
          {temporalData.length > 0 && (
            <div className="mb-6 md:mb-8">
              <h3 className="text-sm md:text-base text-gray-900 mb-4">
                Evolución de Reclamos - {vistaTemportal === 'mensual' ? `${getMesNombre(mesSeleccionado)} ${anioSeleccionado}` : `Año ${anioSeleccionado}`}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={temporalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cantidad" stroke="#3b82f6" strokeWidth={2} name="Reclamos" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Barrios más afectados */}
            <div>
              <h3 className="text-sm md:text-base text-gray-900 mb-4">Barrios más Afectados</h3>
              {barrioData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={barrioData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {barrioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No hay datos para mostrar</p>
                </div>
              )}
            </div>

            {/* Categorías más frecuentes */}
            <div>
              <h3 className="text-sm md:text-base text-gray-900 mb-4">Categorías más Frecuentes</h3>
              {categoryData.length > 0 ? (
                <div className="space-y-2">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div 
                        className="w-full h-10 rounded flex items-center px-4 justify-between"
                        style={{ 
                          backgroundColor: COLORS[index % COLORS.length] + '40',
                          borderLeft: `4px solid ${COLORS[index % COLORS.length]}`
                        }}
                      >
                        <span className="text-gray-800">{item.name}</span>
                        <span className="text-gray-900">{item.cantidad}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[250px] bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No hay datos para mostrar</p>
                </div>
              )}
            </div>
          </div>

          {/* Reclamos por estado */}
          <div className="mt-6 md:mt-8">
            <h3 className="text-sm md:text-base text-gray-900 mb-4">Reclamos por Estado</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cantidad" fill="#3b82f6" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No hay datos para mostrar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
