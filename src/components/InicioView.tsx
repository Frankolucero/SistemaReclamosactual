import { User, Claim } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Clock, FileText, Eye } from 'lucide-react';
import { Badge } from './ui/badge';
import { statusColors, statusLabels, urgencyColors, urgencyLabels } from '../lib/mockData';

interface InicioViewProps {
  currentUser: User;
  claims: Claim[];
  onViewClaim?: (claim: Claim) => void;
  onNavigate?: (view: string) => void;
}

export function InicioView({ currentUser, claims, onViewClaim, onNavigate }: InicioViewProps) {
  const userClaims = currentUser.role === 'externo' 
    ? claims.filter(c => c.asignadoA === currentUser.id)
    : claims;

  const pendingCount = userClaims.filter(c => c.estado === 'pendiente').length;
  const inProgressCount = userClaims.filter(c => c.estado === 'en_proceso').length;
  const resolvedCount = userClaims.filter(c => c.estado === 'resuelto').length;

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl text-gray-900 mb-2">
          Bienvenido, {currentUser.nombre} {currentUser.apellido}
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          {currentUser.role === 'moderador' 
            ? 'Panel de administración del sistema de reclamos vecinales'
            : `Área: ${currentUser.area}`
          }
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl text-gray-900">{userClaims.length}</p>
                <p className="text-xs md:text-sm text-gray-600">Total Reclamos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl text-gray-900">{pendingCount}</p>
                <p className="text-xs md:text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl text-gray-900">{inProgressCount}</p>
                <p className="text-xs md:text-sm text-gray-600">En Proceso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl text-gray-900">{resolvedCount}</p>
                <p className="text-xs md:text-sm text-gray-600">Resueltos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reclamos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Reclamos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userClaims.slice(0, 5).map(claim => (
              <div key={claim.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-gray-900 font-mono text-xs md:text-sm">{claim.numeroSeguimiento}</p>
                    <Badge className={statusColors[claim.estado]} variant="secondary">
                      <span className="text-xs">{statusLabels[claim.estado]}</span>
                    </Badge>
                    <Badge className={urgencyColors[claim.nivelUrgencia]} variant="secondary">
                      <span className="text-xs">{urgencyLabels[claim.nivelUrgencia]}</span>
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{claim.descripcion}</p>
                  <p className="text-xs text-gray-500 mt-1">{claim.barrio} • {claim.fechaCreacion}</p>
                </div>
                {onViewClaim && (
                  <Button size="sm" variant="outline" onClick={() => onViewClaim(claim)} className="gap-2 w-full sm:w-auto">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs md:text-sm">Ver</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      {currentUser.role === 'moderador' && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <button 
                className="p-3 md:p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors"
                onClick={() => onNavigate?.('crear-reclamo')}
              >
                <FileText className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mb-2" />
                <p className="text-sm md:text-base text-gray-900">Crear Reclamo</p>
                <p className="text-xs md:text-sm text-gray-600">Registrar nuevo reclamo</p>
              </button>
              <button 
                className="p-3 md:p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors"
                onClick={() => onNavigate?.('listado-reclamos')}
              >
                <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mb-2" />
                <p className="text-sm md:text-base text-gray-900">Ver Pendientes</p>
                <p className="text-xs md:text-sm text-gray-600">{pendingCount} sin asignar</p>
              </button>
              <button 
                className="p-3 md:p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors"
                onClick={() => onNavigate?.('estadisticas')}
              >
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600 mb-2" />
                <p className="text-sm md:text-base text-gray-900">Estadísticas</p>
                <p className="text-xs md:text-sm text-gray-600">Ver informes</p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}