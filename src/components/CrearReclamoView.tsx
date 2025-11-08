import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Claim, ClaimCategory, UrgencyLevel } from '../types';
import { categoryLabels, urgencyLabels } from '../lib/mockData';
import { Paperclip } from 'lucide-react';

interface CrearReclamoViewProps {
  onCreateClaim: (claim: Partial<Claim>) => void;
}

export function CrearReclamoView({ onCreateClaim }: CrearReclamoViewProps) {
  const [formData, setFormData] = useState({
    descripcion: '',
    categoria: '' as ClaimCategory,
    calle1: '',
    calle2: '',
    calle3: '',
    altura: '',
    barrio: '',
    nivelUrgencia: '' as UrgencyLevel
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newClaim: Partial<Claim> = {
      ...formData,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaActualizacion: new Date().toISOString().split('T')[0],
      actividades: [],
      archivos: [],
      comentarios: []
    };
    
    onCreateClaim(newClaim);
    
    // Reset form
    setFormData({
      descripcion: '',
      categoria: '' as ClaimCategory,
      calle1: '',
      calle2: '',
      calle3: '',
      altura: '',
      barrio: '',
      nivelUrgencia: '' as UrgencyLevel
    });
  };

  const handleCancel = () => {
    setFormData({
      descripcion: '',
      categoria: '' as ClaimCategory,
      calle1: '',
      calle2: '',
      calle3: '',
      altura: '',
      barrio: '',
      nivelUrgencia: '' as UrgencyLevel
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">REGISTRO DE RECLAMO</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción del reclamo..."
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                required
                rows={4}
              />
            </div>

            {/* Fila 1: Calle, Altura, Categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="calle1">Calle</Label>
                <Input
                  id="calle1"
                  placeholder="Entre:"
                  value={formData.calle1}
                  onChange={(e) => setFormData({...formData, calle1: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="altura">Altura</Label>
                <Input
                  id="altura"
                  placeholder="Nº"
                  value={formData.altura}
                  onChange={(e) => setFormData({...formData, altura: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value as ClaimCategory})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fila 2: Calle 1 (Entre), Calle 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="calle2">Calle 1:</Label>
                <Input
                  id="calle2"
                  placeholder=""
                  value={formData.calle2}
                  onChange={(e) => setFormData({...formData, calle2: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="calle3">Calle 2:</Label>
                <Input
                  id="calle3"
                  placeholder=""
                  value={formData.calle3}
                  onChange={(e) => setFormData({...formData, calle3: e.target.value})}
                />
              </div>
            </div>

            {/* Barrio */}
            <div className="space-y-2">
              <Label htmlFor="barrio">Barrio:</Label>
              <Input
                id="barrio"
                placeholder=""
                value={formData.barrio}
                onChange={(e) => setFormData({...formData, barrio: e.target.value})}
                required
              />
            </div>

            {/* Adjuntar Archivos */}
            <div className="space-y-2">
              <Button type="button" variant="outline" className="gap-2 w-full sm:w-auto">
                <Paperclip className="w-4 h-4" />
                Adjuntar Archivos
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-4 md:pt-6" />

            {/* Nivel de Urgencia */}
            <div className="space-y-2">
              <Label htmlFor="urgencia">Nivel de Urgencia:</Label>
              <Select value={formData.nivelUrgencia} onValueChange={(value) => setFormData({...formData, nivelUrgencia: value as UrgencyLevel})}>
                <SelectTrigger className="w-full sm:max-w-xs">
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(urgencyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* IDs (solo lectura, se generan automáticamente) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
              <div>• ID: <span className="font-mono">Auto-generado</span></div>
              <div className="sm:text-right">• Número de Seguimiento: <span className="font-mono">Auto-generado</span></div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 md:pt-6">
              <Button type="button" variant="destructive" onClick={handleCancel} className="w-full sm:w-auto">
                CANCELAR
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                CREAR RECLAMO
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
