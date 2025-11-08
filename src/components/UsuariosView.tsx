import { User, Claim } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { User as UserIcon, Mail, Phone, Briefcase, Activity, Clock, FileEdit, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface UsuariosViewProps {
  users: User[];
  claims: Claim[];
  onApproveUser?: (userId: string) => void;
  onRejectUser?: (userId: string) => void;
}

export function UsuariosView({ users, claims, onApproveUser, onRejectUser }: UsuariosViewProps) {
  const getUserStats = (userId: string) => {
    const userClaims = claims.filter(c => c.asignadoA === userId);
    const lastActivity = userClaims.length > 0 
      ? userClaims.sort((a, b) => b.fechaActualizacion.localeCompare(a.fechaActualizacion))[0].fechaActualizacion
      : 'Sin actividad';
    
    return {
      totalAsignados: userClaims.length,
      pendientes: userClaims.filter(c => c.estado === 'pendiente').length,
      enProceso: userClaims.filter(c => c.estado === 'en_proceso').length,
      resueltos: userClaims.filter(c => c.estado === 'resuelto').length,
      lastActivity
    };
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'moderador':
        return 'bg-purple-100 text-purple-800';
      case 'externo':
        return 'bg-blue-100 text-blue-800';
      case 'usuario':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'moderador':
        return 'Moderador';
      case 'externo':
        return 'Externo';
      case 'usuario':
        return 'Usuario';
      default:
        return role;
    }
  };

  const pendingUsers = users.filter(u => u.accountStatus === 'pending');
  const activeUsers = users.filter(u => u.accountStatus === 'active' || !u.accountStatus);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl text-gray-900 mb-2">Gestión de Usuarios</h2>
        <p className="text-sm md:text-base text-gray-600">
          Administración y seguimiento de usuarios del sistema
        </p>
      </div>

      {/* Solicitudes pendientes */}
      {pendingUsers.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
              <CardTitle className="text-sm md:text-base text-orange-900">
                Solicitudes Pendientes de Aprobación ({pendingUsers.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingUsers.map(user => (
                <div key={user.id} className="bg-white p-3 md:p-4 rounded-lg border border-orange-200">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm md:text-base text-gray-900">
                            {user.nombre} {user.apellido}
                          </p>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            <span className="text-xs">{getRoleLabel(user.role)}</span>
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs md:text-sm ml-11 md:ml-13">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{user.telefono}</span>
                        </div>
                        {user.area && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Briefcase className="w-4 h-4" />
                            <span>{user.area}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        onClick={() => onApproveUser?.(user.id)}
                        className="gap-2 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs md:text-sm">Aprobar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRejectUser?.(user.id)}
                        className="gap-2 flex-1 sm:flex-none"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs md:text-sm">Rechazar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl text-gray-900">{activeUsers.filter(u => u.role === 'moderador').length}</p>
                <p className="text-sm text-gray-600">Moderadores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl text-gray-900">{activeUsers.filter(u => u.role === 'externo').length}</p>
                <p className="text-sm text-gray-600">Usuarios Externos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl text-gray-900">{activeUsers.length}</p>
                <p className="text-sm text-gray-600">Total Usuarios Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Área</TableHead>
                <TableHead className="text-center">Asignados</TableHead>
                <TableHead className="text-center">En Proceso</TableHead>
                <TableHead className="text-center">Resueltos</TableHead>
                <TableHead>Última Actividad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeUsers.map(user => {
                const stats = getUserStats(user.id);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-900">
                            {user.nombre} {user.apellido}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.telefono && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span>{user.telefono}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.area ? (
                          <>
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{user.area}</span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-gray-900">{stats.totalAsignados}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-gray-900">{stats.enProceso}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600">{stats.resueltos}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{stats.lastActivity}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {claims
              .filter(c => c.actividades.length > 0)
              .sort((a, b) => b.fechaActualizacion.localeCompare(a.fechaActualizacion))
              .slice(0, 10)
              .map(claim => {
                const lastActivity = claim.actividades[claim.actividades.length - 1];
                const user = users.find(u => u.id === claim.asignadoA);
                
                return (
                  <div key={claim.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileEdit className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-gray-900">{claim.numeroSeguimiento}</span>
                        {user && (
                          <span className="text-sm text-gray-600">
                            - {user.nombre} {user.apellido}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{lastActivity.descripcion}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{lastActivity.fecha}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
