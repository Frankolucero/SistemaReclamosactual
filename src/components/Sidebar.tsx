import { UserRole } from '../types';
import { 
  Home, 
  PlusCircle, 
  List, 
  BarChart3, 
  Search,
  Users,
  X
} from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userRole: UserRole;
  pendingUsersCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ 
  currentView, 
  onViewChange, 
  userRole, 
  pendingUsersCount = 0,
  isOpen = false,
  onClose
}: SidebarProps) {
  const menuItems = [
    {
      id: 'inicio',
      label: 'INICIO',
      icon: Home,
      roles: ['moderador', 'externo']
    },
    {
      id: 'crear-reclamo',
      label: 'Crear Reclamo',
      icon: PlusCircle,
      roles: ['moderador']
    },
    {
      id: 'listado-reclamos',
      label: 'Listado Reclamos',
      icon: List,
      roles: ['moderador', 'externo']
    },
    {
      id: 'estadisticas',
      label: 'Información Estadística',
      icon: BarChart3,
      roles: ['moderador', 'externo']
    },
    {
      id: 'buscar-reclamo',
      label: 'Buscar Reclamo',
      icon: Search,
      roles: ['moderador', 'externo', 'usuario']
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: Users,
      roles: ['moderador']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleViewChange = (view: string) => {
    onViewChange(view);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-50 border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        <div className="p-4 md:p-6">
          {/* Botón cerrar en móvil */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-sm text-gray-900">
              MENÚ
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <h2 className="text-gray-900 mb-4 md:mb-6 hidden lg:block">
            SISTEMA DE RECLAMOS VECINALES
          </h2>
          
          {userRole !== 'usuario' && (
            <div className="mb-4 md:mb-6 text-sm text-gray-600 italic">
              {userRole === 'moderador' ? 'Moderador' : 'Externo'}
            </div>
          )}
          
          <nav className="space-y-1 md:space-y-2">
            {filteredMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="flex-1 text-sm md:text-base">{item.label}</span>
                  {item.id === 'usuarios' && pendingUsersCount > 0 && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {pendingUsersCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
