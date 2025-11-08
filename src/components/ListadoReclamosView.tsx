import { useState } from 'react';
import { Claim, UserRole } from '../types';
import { categoryLabels, statusLabels, statusColors, urgencyColors, urgencyLabels } from '../lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Eye, Edit, Trash2, UserPlus, Search } from 'lucide-react';

interface ListadoReclamosViewProps {
  claims: Claim[];
  userRole: UserRole;
  onEditClaim: (claim: Claim) => void;
  onDeleteClaim: (claimId: string) => void;
  onAssignClaim: (claimId: string) => void;
  onViewClaim: (claim: Claim) => void;
}

export function ListadoReclamosView({ 
  claims, 
  userRole, 
  onEditClaim, 
  onDeleteClaim,
  onAssignClaim,
  onViewClaim 
}: ListadoReclamosViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.numeroSeguimiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.barrio.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || claim.estado === filterStatus;
    const matchesCategory = filterCategory === 'all' || claim.categoria === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingClaims = claims.filter(c => c.estado === 'pendiente');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Sección de reclamos sin asignar (solo moderador) */}
      {userRole === 'moderador' && pendingClaims.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base md:text-lg">
              <span className="text-yellow-800">Reclamos Pendientes de Asignación</span>
              <Badge variant="secondary">{pendingClaims.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingClaims.map(claim => (
                <div key={claim.id} className="bg-white p-3 md:p-4 rounded-lg border border-yellow-200 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs md:text-sm">{claim.numeroSeguimiento}</span>
                      <Badge className={urgencyColors[claim.nivelUrgencia]}>
                        <span className="text-xs">{urgencyLabels[claim.nivelUrgencia]}</span>
                      </Badge>
                      <span className="text-xs md:text-sm text-gray-600">{categoryLabels[claim.categoria]}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 mt-1 line-clamp-2">{claim.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {claim.calle1} {claim.altura}, {claim.barrio}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => onViewClaim(claim)} size="sm" variant="outline" className="gap-2 flex-1 sm:flex-none">
                      <Eye className="w-4 h-4" />
                      <span className="sm:hidden">Ver</span>
                    </Button>
                    <Button onClick={() => onAssignClaim(claim.id)} size="sm" className="gap-2 flex-1 sm:flex-none">
                      <UserPlus className="w-4 h-4" />
                      Asignar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listado principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Listado de Reclamos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por número, descripción o barrio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de reclamos - Desktop */}
          <div className="hidden lg:block border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Nº Seguimiento</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Categoría</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Descripción</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Ubicación</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Estado</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Urgencia</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredClaims.map(claim => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{claim.numeroSeguimiento}</td>
                    <td className="px-4 py-3 text-sm">{categoryLabels[claim.categoria]}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{claim.descripcion}</td>
                    <td className="px-4 py-3 text-sm">{claim.barrio}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusColors[claim.estado]}>
                        {statusLabels[claim.estado]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={urgencyColors[claim.nivelUrgencia]}>
                        {urgencyLabels[claim.nivelUrgencia]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => onViewClaim(claim)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {userRole === 'moderador' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => onEditClaim(claim)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onDeleteClaim(claim.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        {userRole === 'externo' && claim.estado === 'en_proceso' && (
                          <Button size="sm" variant="outline" onClick={() => onEditClaim(claim)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredClaims.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No se encontraron reclamos
              </div>
            )}
          </div>

          {/* Cards para móvil */}
          <div className="lg:hidden space-y-3">
            {filteredClaims.map(claim => (
              <div key={claim.id} className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs">{claim.numeroSeguimiento}</span>
                  <Badge className={statusColors[claim.estado]}>
                    <span className="text-xs">{statusLabels[claim.estado]}</span>
                  </Badge>
                  <Badge className={urgencyColors[claim.nivelUrgencia]}>
                    <span className="text-xs">{urgencyLabels[claim.nivelUrgencia]}</span>
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-1">{categoryLabels[claim.categoria]}</p>
                <p className="text-sm text-gray-900 mb-2 line-clamp-2">{claim.descripcion}</p>
                <p className="text-xs text-gray-500 mb-3">{claim.barrio}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onViewClaim(claim)} className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="text-xs">Ver</span>
                  </Button>
                  {userRole === 'moderador' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => onEditClaim(claim)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDeleteClaim(claim.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  {userRole === 'externo' && claim.estado === 'en_proceso' && (
                    <Button size="sm" variant="outline" onClick={() => onEditClaim(claim)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {filteredClaims.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No se encontraron reclamos
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}