import { useState } from 'react';
import { Claim, User } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mockUsers } from '../lib/mockData';

interface AsignarReclamoDialogProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (claimId: string, userId: string, area: string) => void;
  users?: User[];
}

export function AsignarReclamoDialog({ claim, isOpen, onClose, onAssign, users = mockUsers }: AsignarReclamoDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState('');

  const externalUsers = users.filter(u => u.role === 'externo');

  const handleAssign = () => {
    if (!claim || !selectedUserId) return;

    const selectedUser = externalUsers.find(u => u.id === selectedUserId);
    if (selectedUser) {
      onAssign(claim.id, selectedUserId, selectedUser.area || '');
    }
    onClose();
  };

  if (!claim) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Reclamo</DialogTitle>
          <DialogDescription>
            Seleccione el área o responsable para asignar este reclamo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><span className="text-sm text-gray-600">Reclamo:</span> {claim.numeroSeguimiento}</p>
            <p><span className="text-sm text-gray-600">Categoría:</span> {claim.categoria}</p>
            <p><span className="text-sm text-gray-600">Descripción:</span> {claim.descripcion}</p>
            <p><span className="text-sm text-gray-600">Urgencia:</span> {claim.nivelUrgencia}</p>
          </div>

          <div className="space-y-2">
            <Label>Asignar a:</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un área o responsable..." />
              </SelectTrigger>
              <SelectContent>
                {externalUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.area} - {user.nombre} {user.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleAssign} disabled={!selectedUserId}>
              Asignar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}