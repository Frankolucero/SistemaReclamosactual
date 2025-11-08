import { useState } from 'react';
import { Claim, ClaimCategory } from '../types';
import { categoryLabels, statusLabels, statusColors, urgencyColors, urgencyLabels } from '../lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, FileText, MapPin, Calendar, User } from 'lucide-react';
import { Textarea } from './ui/textarea';
import * as api from '../lib/api';
import { toast } from 'sonner@2.0.3';

interface BuscarReclamoViewProps {
  claims: Claim[];
  canComment: boolean;
  onViewDetail?: (claim: Claim) => void;
}

export function BuscarReclamoView({ claims, canComment, onViewDetail }: BuscarReclamoViewProps) {
  const [searchType, setSearchType] = useState<'seguimiento' | 'id'>('seguimiento');
  const [searchValue, setSearchValue] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [filteredResults, setFilteredResults] = useState<Claim[]>([]);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleSearch = () => {
    // Aplicar filtros
    let results = claims;
    
    // Filtrar por categoría si está seleccionada
    if (filterCategory !== 'all') {
      results = results.filter(c => c.categoria === filterCategory);
    }
    
    // Buscar por número de seguimiento o ID
    if (searchValue.trim()) {
      const claim = results.find(c => 
        searchType === 'seguimiento' 
          ? c.numeroSeguimiento.toLowerCase() === searchValue.toLowerCase()
          : c.id === searchValue
      );
      
      if (claim) {
        setSelectedClaim(claim);
        setFilteredResults([]);
      } else {
        setSelectedClaim(null);
        setFilteredResults([]);
      }
    } else if (filterCategory !== 'all') {
      // Si solo hay filtro de categoría, mostrar todos los resultados de esa categoría
      setFilteredResults(results);
      setSelectedClaim(null);
    } else {
      setFilteredResults([]);
      setSelectedClaim(null);
    }
  };

  const handleSubmitComment = async () => {
    if (comment.trim() && selectedClaim) {
      setSubmittingComment(true);
      try {
        const { claim } = await api.addComment(selectedClaim.id, comment.trim());
        setSelectedClaim(claim);
        setComment('');
        toast.success('Comentario enviado', {
          description: 'Gracias por tu feedback'
        });
      } catch (error: any) {
        console.error('Error submitting comment:', error);
        toast.error('Error al enviar comentario', {
          description: error.message
        });
      } finally {
        setSubmittingComment(false);
      }
    }
  };

  const handleViewDetailClick = (claim: Claim) => {
    if (onViewDetail) {
      onViewDetail(claim);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">VISUALIZACIÓN DE RECLAMOS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label>Número de Seguimiento:</Label>
              <Input
                placeholder="VM-2025-XXX"
                value={searchType === 'seguimiento' ? searchValue : ''}
                onChange={(e) => {
                  setSearchType('seguimiento');
                  setSearchValue(e.target.value);
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label>ID reclamo:</Label>
              <Input
                placeholder="001"
                value={searchType === 'id' ? searchValue : ''}
                onChange={(e) => {
                  setSearchType('id');
                  setSearchValue(e.target.value);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoría:</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSearch} className="gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4" />
              Buscar
            </Button>
            {selectedClaim && onViewDetail && (
              <Button onClick={() => handleViewDetailClick(selectedClaim)} variant="outline" className="gap-2 w-full sm:w-auto">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Ver Detalle Completo</span>
                <span className="sm:hidden">Detalle Completo</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados de búsqueda por categoría - Listado */}
      {filteredResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Resultados para {categoryLabels[filterCategory as ClaimCategory]} ({filteredResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredResults.map(claim => (
                <div 
                  key={claim.id} 
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-xs md:text-sm text-gray-900">{claim.numeroSeguimiento}</span>
                      <Badge className={statusColors[claim.estado]}>
                        <span className="text-xs">{statusLabels[claim.estado]}</span>
                      </Badge>
                      <Badge className={urgencyColors[claim.nivelUrgencia]}>
                        <span className="text-xs">{urgencyLabels[claim.nivelUrgencia]}</span>
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 mb-1 line-clamp-2">{claim.descripcion}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {claim.calle1} {claim.altura}, {claim.barrio}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {claim.fechaCreacion}
                      </span>
                      {claim.areaAsignada && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {claim.areaAsignada}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleViewDetailClick(claim)} 
                    size="sm" 
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-xs md:text-sm">Ver Detalle</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado individual - Resumen */}
      {selectedClaim && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reclamo {selectedClaim.numeroSeguimiento}</CardTitle>
              <div className="flex gap-2">
                <Badge className={statusColors[selectedClaim.estado]}>
                  {statusLabels[selectedClaim.estado]}
                </Badge>
                <Badge className={urgencyColors[selectedClaim.nivelUrgencia]}>
                  {urgencyLabels[selectedClaim.nivelUrgencia]}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Categoría:</p>
                    <p className="text-gray-900">{categoryLabels[selectedClaim.categoria]}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Ubicación:</p>
                    <p className="text-gray-900">
                      Calle: {selectedClaim.calle1} - Altura: {selectedClaim.altura}
                    </p>
                    {selectedClaim.calle2 && <p className="text-sm text-gray-600">Entre: {selectedClaim.calle2}</p>}
                    {selectedClaim.calle3 && <p className="text-sm text-gray-600">y {selectedClaim.calle3}</p>}
                    <p className="text-sm text-gray-600">Barrio: {selectedClaim.barrio}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha de creación:</p>
                    <p className="text-gray-900">{selectedClaim.fechaCreacion}</p>
                  </div>
                </div>
                
                {selectedClaim.areaAsignada && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Área asignada:</p>
                      <p className="text-gray-900">{selectedClaim.areaAsignada}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Descripción:</p>
              <p className="text-gray-900">{selectedClaim.descripcion}</p>
            </div>

            {/* Archivos adjuntos */}
            {selectedClaim.archivos && selectedClaim.archivos.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Archivos Adjuntos:</p>
                <div className="space-y-2">
                  {selectedClaim.archivos.map((archivo, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-blue-600">
                      <FileText className="w-4 h-4" />
                      <span>{archivo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actividades realizadas */}
            {selectedClaim.actividades.length > 0 && (
              <div>
                <p className="text-gray-900 mb-3">Actividades Realizadas:</p>
                <div className="space-y-3">
                  {selectedClaim.actividades.map((actividad, idx) => (
                    <div key={actividad.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-600">{actividad.fecha}</span>
                      </div>
                      <p className="text-gray-900">{actividad.descripcion}</p>
                      <p className="text-sm text-gray-600 mt-1">Personal: {actividad.personal}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comentarios (si está resuelto y puede comentar) */}
            {selectedClaim.estado === 'resuelto' && canComment && (
              <div className="border-t pt-6">
                <p className="text-gray-900 mb-3">Estado: Pendiente</p>
                <p className="text-sm text-gray-600 mb-3">
                  El reclamo ha sido resuelto. Por favor, déjenos su opinión sobre la resolución:
                </p>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Escriba su comentario aquí..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleSubmitComment} disabled={!comment.trim() || submittingComment}>
                    {submittingComment ? 'Enviando...' : 'Enviar Comentario'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {searchValue && !selectedClaim && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No se encontró ningún reclamo con ese número de seguimiento o ID
          </CardContent>
        </Card>
      )}
    </div>
  );
}