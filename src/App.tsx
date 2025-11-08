import { useState, useEffect } from 'react';
import { User, Claim } from './types';
import * as api from './lib/api';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InicioView } from './components/InicioView';
import { CrearReclamoView } from './components/CrearReclamoView';
import { ListadoReclamosView } from './components/ListadoReclamosView';
import { EstadisticasView } from './components/EstadisticasView';
import { BuscarReclamoView } from './components/BuscarReclamoView';
import { UsuariosView } from './components/UsuariosView';
import { EditarReclamoDialog } from './components/EditarReclamoDialog';
import { AsignarReclamoDialog } from './components/AsignarReclamoDialog';
import { DetalleReclamoDialog } from './components/DetalleReclamoDialog';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('inicio');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showRegister, setShowRegister] = useState(false);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [assigningClaim, setAssigningClaim] = useState<Claim | null>(null);
  const [viewingClaim, setViewingClaim] = useState<Claim | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingEmails, setExistingEmails] = useState<string[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (currentUser && currentUser.id !== 'guest') {
      loadData();
    }
  }, [currentUser]);

  const checkSession = async () => {
    try {
      const { user } = await api.getSession();
      if (user && user.accountStatus === 'active') {
        setCurrentUser(user);
        if (user.role === 'usuario') {
          setCurrentView('buscar-reclamo');
        } else {
          setCurrentView('inicio');
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load claims
      const { claims: loadedClaims } = await api.getClaims();
      setClaims(loadedClaims);

      // Load users if moderator
      if (currentUser?.role === 'moderador') {
        const { users: loadedUsers } = await api.getUsers();
        setUsers(loadedUsers);
        setExistingEmails(loadedUsers.map(u => u.email.toLowerCase()));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    }
  };

  const handleLogin = async (user: User) => {
    // Si es un usuario invitado (sin email), permitir acceso directo
    if (user.id === 'guest' && user.email === '') {
      setCurrentUser(user);
      setCurrentView('buscar-reclamo');
      setLoading(false);
      return;
    }
    
    // El login real se maneja en LoginPage
    setCurrentUser(user);
    if (user.role === 'usuario') {
      setCurrentView('buscar-reclamo');
    } else {
      setCurrentView('inicio');
    }
  };

  const handleRegister = async (newUserData: Omit<User, 'id'>) => {
    try {
      // Generate a temporary password - in production, user should set this
      const tempPassword = Math.random().toString(36).slice(-8);
      
      await api.signup({
        email: newUserData.email,
        password: tempPassword,
        nombre: newUserData.nombre,
        apellido: newUserData.apellido,
        telefono: newUserData.telefono,
        role: newUserData.role,
        area: newUserData.area
      });

      toast.success('Solicitud enviada', {
        description: 'Tu cuenta será revisada por un moderador. Se te enviará un correo con tu contraseña temporal.'
      });
      
      setShowRegister(false);
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast.error('Error al registrar usuario', {
        description: error.message || 'Intenta nuevamente'
      });
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await api.updateUserStatus(userId, 'active');
      
      // Reload users
      const { users: loadedUsers } = await api.getUsers();
      setUsers(loadedUsers);
      
      const user = loadedUsers.find(u => u.id === userId);
      toast.success('Usuario aprobado', {
        description: `${user?.nombre} ${user?.apellido} ahora puede iniciar sesión`
      });
    } catch (error: any) {
      console.error('Error approving user:', error);
      toast.error('Error al aprobar usuario', {
        description: error.message
      });
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (window.confirm('¿Está seguro de rechazar esta solicitud? El usuario no podrá iniciar sesión.')) {
      try {
        await api.updateUserStatus(userId, 'rejected');
        
        // Reload users
        const { users: loadedUsers } = await api.getUsers();
        setUsers(loadedUsers);
        
        const user = loadedUsers.find(u => u.id === userId);
        toast.error('Solicitud rechazada', {
          description: `La solicitud de ${user?.nombre} ${user?.apellido} ha sido rechazada`
        });
      } catch (error: any) {
        console.error('Error rejecting user:', error);
        toast.error('Error al rechazar usuario', {
          description: error.message
        });
      }
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setCurrentView('inicio');
    setShowRegister(false);
    setClaims([]);
    setUsers([]);
  };

  const handleCreateClaim = async (newClaim: Partial<Claim>) => {
    try {
      const { claim } = await api.createClaim(newClaim);
      
      // Reload claims
      const { claims: loadedClaims } = await api.getClaims();
      setClaims(loadedClaims);
      
      toast.success('Reclamo creado exitosamente', {
        description: `Número de seguimiento: ${claim.numeroSeguimiento}`
      });
      setCurrentView('listado-reclamos');
    } catch (error: any) {
      console.error('Error creating claim:', error);
      toast.error('Error al crear reclamo', {
        description: error.message
      });
    }
  };

  const handleEditClaim = (claim: Claim) => {
    setEditingClaim(claim);
  };

  const handleSaveEditedClaim = async (updatedClaim: Claim) => {
    try {
      await api.updateClaim(updatedClaim.id, updatedClaim);
      
      // Reload claims
      const { claims: loadedClaims } = await api.getClaims();
      setClaims(loadedClaims);
      
      setEditingClaim(null);
      toast.success('Reclamo actualizado exitosamente');
    } catch (error: any) {
      console.error('Error updating claim:', error);
      toast.error('Error al actualizar reclamo', {
        description: error.message
      });
    }
  };

  const handleDeleteClaim = async (claimId: string) => {
    if (window.confirm('¿Está seguro de eliminar este reclamo?')) {
      try {
        await api.deleteClaim(claimId);
        
        // Reload claims
        const { claims: loadedClaims } = await api.getClaims();
        setClaims(loadedClaims);
        
        toast.success('Reclamo eliminado');
      } catch (error: any) {
        console.error('Error deleting claim:', error);
        toast.error('Error al eliminar reclamo', {
          description: error.message
        });
      }
    }
  };

  const handleAssignClaim = (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    if (claim) {
      setAssigningClaim(claim);
    }
  };

  const handleSaveAssignment = async (claimId: string, userId: string, area: string) => {
    try {
      await api.updateClaim(claimId, {
        estado: 'asignado',
        asignadoA: userId,
        areaAsignada: area
      });
      
      // Reload claims
      const { claims: loadedClaims } = await api.getClaims();
      setClaims(loadedClaims);
      
      setAssigningClaim(null);
      toast.success('Reclamo asignado exitosamente', {
        description: `Asignado a ${area}`
      });
    } catch (error: any) {
      console.error('Error assigning claim:', error);
      toast.error('Error al asignar reclamo', {
        description: error.message
      });
    }
  };

  const handleViewClaim = (claim: Claim) => {
    setViewingClaim(claim);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (showRegister) {
      return (
        <>
          <RegisterPage 
            onRegister={handleRegister}
            onBackToLogin={() => setShowRegister(false)}
            existingEmails={existingEmails}
          />
          <Toaster />
        </>
      );
    }
    
    return (
      <>
        <LoginPage 
          onLogin={handleLogin}
          onRegister={() => setShowRegister(true)}
        />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onMenuClick={() => setSidebarOpen(true)}
        showMenuButton={currentUser.id !== 'guest'}
      />
      
      <div className="flex">
        {currentUser.id !== 'guest' && (
          <Sidebar 
            currentView={currentView} 
            onViewChange={setCurrentView}
            userRole={currentUser.role}
            pendingUsersCount={users.filter(u => u.accountStatus === 'pending').length}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {currentView === 'inicio' && (
            <InicioView 
              currentUser={currentUser} 
              claims={claims} 
              onViewClaim={handleViewClaim}
              onNavigate={setCurrentView}
            />
          )}
          
          {currentView === 'crear-reclamo' && currentUser.role === 'moderador' && (
            <CrearReclamoView onCreateClaim={handleCreateClaim} />
          )}
          
          {currentView === 'listado-reclamos' && (
            <ListadoReclamosView 
              claims={claims}
              userRole={currentUser.role}
              onEditClaim={handleEditClaim}
              onDeleteClaim={handleDeleteClaim}
              onAssignClaim={handleAssignClaim}
              onViewClaim={handleViewClaim}
            />
          )}
          
          {currentView === 'estadisticas' && (currentUser.role === 'moderador' || currentUser.role === 'externo') && (
            <EstadisticasView claims={claims} />
          )}
          
          {currentView === 'buscar-reclamo' && (
            <BuscarReclamoView 
              claims={claims}
              canComment={currentUser.role === 'usuario'}
              onViewDetail={handleViewClaim}
            />
          )}
          
          {currentView === 'usuarios' && currentUser.role === 'moderador' && (
            <UsuariosView 
              users={users} 
              claims={claims}
              onApproveUser={handleApproveUser}
              onRejectUser={handleRejectUser}
            />
          )}
        </main>
      </div>

      <EditarReclamoDialog
        claim={editingClaim}
        isOpen={!!editingClaim}
        onClose={() => setEditingClaim(null)}
        onSave={handleSaveEditedClaim}
        userRole={currentUser.role}
      />

      <AsignarReclamoDialog
        claim={assigningClaim}
        isOpen={!!assigningClaim}
        onClose={() => setAssigningClaim(null)}
        onAssign={handleSaveAssignment}
        users={users}
      />

      <DetalleReclamoDialog
        claim={viewingClaim}
        isOpen={!!viewingClaim}
        onClose={() => setViewingClaim(null)}
      />

      <Toaster />
    </div>
  );
}