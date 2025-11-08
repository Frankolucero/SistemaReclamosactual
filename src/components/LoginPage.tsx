import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { User } from '../types';
import * as api from '../lib/api';
import { toast } from 'sonner@2.0.3';
import muniHeader from '../public/muni-header.webp'; // <- AÑADIDO

interface LoginPageProps {
  onLogin: (user: User) => void;
  onRegister?: () => void;
}

export function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await api.login(email, password);
      
      if (user) {
        onLogin(user);
        toast.success('Bienvenido', {
          description: `${user.nombre} ${user.apellido}`
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error.message || 'Error al iniciar sesión';
      
      if (errorMessage.includes('not active')) {
        toast.error('Cuenta no activa', {
          description: 'Tu cuenta está pendiente de aprobación o ha sido rechazada'
        });
      } else if (errorMessage.includes('Invalid login')) {
        toast.error('Credenciales inválidas', {
          description: 'Email o contraseña incorrectos'
        });
      } else {
        toast.error('Error al iniciar sesión', {
          description: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    onLogin({
      id: 'guest',
      nombre: 'Invitado',
      apellido: '',
      telefono: '',
      email: '',
      role: 'usuario'
    });
  };

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
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@villamercedes.gob.ar"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleGuestAccess}
                disabled={loading}
              >
                Buscar Reclamo (Sin Iniciar Sesión)
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Usuarios de prueba:</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Moderador: juan.perez@villamercedes.gob.ar (admin123)</p>
                <p>• Externo: maria.gonzalez@villamercedes.gob.ar (externo123)</p>
                <p>• Externo: carlos.rodriguez@villamercedes.gob.ar (externo123)</p>
              </div>
            </div>

            {onRegister && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <button 
                    onClick={onRegister}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                    disabled={loading}
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}