import { Claim } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { categoryLabels, statusLabels, statusColors, urgencyColors, urgencyLabels } from '../lib/mockData';
import { FileText, MapPin, Calendar, User, Clock } from 'lucide-react';
import { Separator } from './ui/separator';

interface DetalleReclamoDialogProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetalleReclamoDialog({ claim, isOpen, onClose }: DetalleReclamoDialogProps) {
  if (!claim) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Reclamo {claim.numeroSeguimiento}</DialogTitle>
              <DialogDescription>ID: {claim.id}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={statusColors[claim.estado]}>
                {statusLabels[claim.estado]}
              </Badge>
              <Badge className={urgencyColors[claim.nivelUrgencia]}>
                {urgencyLabels[claim.nivelUrgencia]}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Categoría</p>
                  <p className="text-gray-900">{categoryLabels[claim.categoria]}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Ubicación</p>
                  <p className="text-gray-900">
                    {claim.calle1} {claim.altura}
                  </p>
                  {claim.calle2 && (
                    <p className="text-sm text-gray-600">Entre: {claim.calle2}</p>
                  )}
                  {claim.calle3 && (
                    <p className="text-sm text-gray-600">y {claim.calle3}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">Barrio: {claim.barrio}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Fechas</p>
                  <p className="text-sm text-gray-900">Creación: {claim.fechaCreacion}</p>
                  <p className="text-sm text-gray-900">Última actualización: {claim.fechaActualizacion}</p>
                </div>
              </div>
              
              {claim.areaAsignada && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Área asignada</p>
                    <p className="text-gray-900">{claim.areaAsignada}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Descripción */}
          <div>
            <h3 className="text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descripción del Reclamo
            </h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {claim.descripcion}
            </p>
          </div>

          {/* Archivos adjuntos */}
          {claim.archivos && claim.archivos.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-gray-900 mb-3">Archivos Adjuntos</h3>
                <div className="space-y-2">
                  {claim.archivos.map((archivo, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-50 p-3 rounded-lg"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{archivo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actividades realizadas */}
          {claim.actividades.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Historial de Actividades
                </h3>
                <div className="space-y-3">
                  {claim.actividades.map((actividad, idx) => (
                    <div 
                      key={actividad.id} 
                      className="bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-lg border-l-4 border-blue-500"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">{actividad.descripcion}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {actividad.personal}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {actividad.fecha}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Comentarios */}
          {claim.comentarios && claim.comentarios.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-gray-900 mb-3">Comentarios</h3>
                <div className="space-y-2">
                  {claim.comentarios.map((comentario, idx) => (
                    <div key={idx} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-700">{comentario}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
