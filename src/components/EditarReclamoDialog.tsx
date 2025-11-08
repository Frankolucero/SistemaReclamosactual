import { useState } from 'react';
import { Claim, ClaimStatus, UserRole } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { statusLabels } from '../lib/mockData';

interface EditarReclamoDialogProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClaim: Claim) => void;
  userRole: UserRole;
}

export function EditarReclamoDialog({ claim, isOpen, onClose, onSave, userRole }: EditarReclamoDialogProps) {
  const [estado, setEstado] = useState<ClaimStatus>(claim?.estado || 'pendiente');
  const [actividadDescripcion, setActividadDescripcion] = useState('');
  const [actividadPersonal, setActividadPersonal] = useState('');

  const handleSave = () => {
    if (!claim) return;

    const newActivity = actividadDescripcion.trim() ? {
      id: `a${Date.now()}`,
      descripcion: actividadDescripcion,
      personal: actividadPersonal,
      fecha: new Date().toLocaleString('es-AR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } : null;

    const updatedClaim: Claim = {
      ...claim,
      estado,
      actividades: newActivity 
        ? [...claim.actividades, newActivity]
        : claim.actividades,
      fechaActualizacion: new Date().toISOString().split('T')[0]
    };

    onSave(updatedClaim);
    setActividadDescripcion('');
    setActividadPersonal('');
    onClose();
  };

  if (!claim) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {userRole === 'moderador' ? 'Editar Reclamo' : 'Actualizar Reclamo'} - {claim.numeroSeguimiento}
          </DialogTitle>
          <DialogDescription>
            Actualice el estado del reclamo y agregue actividades realizadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={estado} onValueChange={(value) => setEstado(value as ClaimStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Información del reclamo (solo lectura para externos) */}
          {userRole === 'externo' && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><span className="text-sm text-gray-600">Categoría:</span> {claim.categoria}</p>
              <p><span className="text-sm text-gray-600">Descripción:</span> {claim.descripcion}</p>
              <p><span className="text-sm text-gray-600">Ubicación:</span> {claim.calle1} {claim.altura}, {claim.barrio}</p>
            </div>
          )}

          {/* Agregar actividad */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-gray-900">Agregar Actividad Realizada</h3>
            
            <div className="space-y-2">
              <Label>Descripción de la actividad</Label>
              <Textarea
                placeholder="Describa la actividad realizada..."
                value={actividadDescripcion}
                onChange={(e) => setActividadDescripcion(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Personal</Label>
              <Input
                placeholder="Nombre del personal"
                value={actividadPersonal}
                onChange={(e) => setActividadPersonal(e.target.value)}
              />
            </div>
          </div>

          {/* Actividades anteriores */}
          {claim.actividades.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-gray-900 mb-3">Historial de Actividades</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {claim.actividades.map((actividad, idx) => (
                  <div key={actividad.id} className="bg-gray-50 p-3 rounded text-sm">
                    <p className="text-gray-900">{actividad.descripcion}</p>
                    <p className="text-gray-600 text-xs mt-1">
                      {actividad.personal} - {actividad.fecha}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}