import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, UserRole } from '../types';
import muniHeader from '../public/muni-header.webp'; // <- AÑADIDO
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface RegisterPageProps {
  onRegister: (user: Omit<User, 'id'>) => void;
  onBackToLogin: () => void;
  existingEmails: string[];
}

export function RegisterPage({ onRegister, onBackToLogin, existingEmails }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    area: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (!formData.apellido.trim()) {
      setError('El apellido es obligatorio');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      return false;
    }
    if (existingEmails.includes(formData.email.toLowerCase())) {
      setError('Este email ya está registrado');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('El email no es válido');
      return false;
    }
    if (!formData.password) {
      setError('La contraseña es obligatoria');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (!formData.telefono.trim()) {
      setError('El teléfono es obligatorio');
      return false;
    }
    if (!formData.role) {
      setError('Debe seleccionar un rol');
      return false;
    }
    if (formData.role === 'externo' && !formData.area.trim()) {
      setError('El área es obligatoria para usuarios externos');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    const newUser: Omit<User, 'id'> = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      telefono: formData.telefono.trim(),
      email: formData.email.toLowerCase().trim(),
      role: formData.role as UserRole,
      area: formData.role === 'externo' ? formData.area.trim() : undefined,
      accountStatus: 'pending'
    };

    onRegister(newUser);
    setSuccess(true);
    
    // Redirigir al login después de 3 segundos
    setTimeout(() => {
      onBackToLogin();
    }, 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl text-gray-900 mb-2">¡Solicitud Enviada!</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-4">
                    Tu solicitud de cuenta ha sido enviada correctamente.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 text-xs md:text-sm">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-blue-900 text-left">
                        <p className="mb-1">Tu cuenta está pendiente de aprobación por un moderador.</p>
                        <p>Recibirás un correo cuando tu cuenta sea activada.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 md:space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4 md:mb-6"> {/* <- RESTAURADO */}
            <img src={muniHeader} alt="Municipalidad de Villa Mercedes" className="h-16 md:h-20 object-contain" />
          </div>
          <h1 className="text-xl md:text-2xl text-gray-900 mb-2">Sistema de Reclamos Vecinales</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBackToLogin}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </div>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>
              Complete el formulario para registrarse en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    type="text"
                    placeholder="Pérez"
                    value={formData.apellido}
                    onChange={(e) => handleChange('apellido', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="266-1234567"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol Solicitado *</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un rol..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="externo">Usuario Externo (Área Municipal)</SelectItem>
                    <SelectItem value="moderador">Moderador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Tu cuenta será revisada por un moderador
                </p>
              </div>

              {formData.role === 'externo' && (
                <div className="space-y-2">
                  <Label htmlFor="area">Área Municipal *</Label>
                  <Select value={formData.area} onValueChange={(value) => handleChange('area', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un área..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Obras Públicas">Obras Públicas</SelectItem>
                      <SelectItem value="Servicios Públicos">Servicios Públicos</SelectItem>
                      <SelectItem value="Higiene Urbana">Higiene Urbana</SelectItem>
                      <SelectItem value="Tránsito">Tránsito</SelectItem>
                      <SelectItem value="Espacios Verdes">Espacios Verdes</SelectItem>
                      <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full">
                Registrarse
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <button 
                  onClick={onBackToLogin}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}