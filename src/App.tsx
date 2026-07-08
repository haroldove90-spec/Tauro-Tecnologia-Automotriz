import { useState, useEffect } from 'react';
import { 
  Wrench, Shield, Users, CreditCard, ChevronRight, Menu, X, 
  Bell, HelpCircle, CheckCircle, Smartphone, Award, ClipboardCheck 
} from 'lucide-react';
import { ServiceOrder, PartInventory, User } from './types';
import { INITIAL_ORDERS, INITIAL_INVENTORY, INITIAL_USERS } from './data/mockData';
import AsesorView from './components/AsesorView';
import MecanicoView from './components/MecanicoView';
import AdminView from './components/AdminView';
import ClienteView from './components/ClienteView';

export default function App() {
  // Sync state with localStorage to enable flawless real-time demo updates across role switches!
  const [orders, setOrders] = useState<ServiceOrder[]>(() => {
    const local = localStorage.getItem('taller_orders');
    return local ? JSON.parse(local) : INITIAL_ORDERS;
  });

  const [inventory, setInventory] = useState<PartInventory[]>(() => {
    const local = localStorage.getItem('taller_inventory');
    return local ? JSON.parse(local) : INITIAL_INVENTORY;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('taller_users');
    return local ? JSON.parse(local) : INITIAL_USERS;
  });

  const [activeRole, setActiveRole] = useState<'Asesor' | 'Mecánico' | 'Admin' | 'Cliente'>(() => {
    const local = localStorage.getItem('taller_active_role');
    return (local as any) || 'Admin'; // Default to Admin dashboard as it has the main gorgeous charts!
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([
    '🚙 María Fernanda Ruiz ingresó un Honda Civic (824-CDX) en rampa.',
    '🚨 Mecánico Gómez solicita aprobación de empaque de tapa de punterías para OS-1002.',
    '🔧 Mecánica Cárdenas terminó la reparación del amortiguador en OS-1003.',
    '👍 Diana Laura Castillo autorizó el presupuesto completo para OS-1004.'
  ]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Write state to localStorage on any modification
  useEffect(() => {
    localStorage.setItem('taller_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('taller_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('taller_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('taller_active_role', activeRole);
  }, [activeRole]);

  // Toast notifier helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    // Add to notification array
    setNotifications(prev => [msg, ...prev.slice(0, 7)]);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleAddOrder = (newOrder: ServiceOrder) => {
    setOrders([newOrder, ...orders]);
  };

  const handleUpdateOrder = (updatedOrder: ServiceOrder) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  // Reset demo to factory defaults
  const handleResetDemo = () => {
    if (window.confirm('¿Está seguro de reiniciar los datos del simulador a su estado original?')) {
      localStorage.removeItem('taller_orders');
      localStorage.removeItem('taller_inventory');
      localStorage.removeItem('taller_users');
      setOrders(INITIAL_ORDERS);
      setInventory(INITIAL_INVENTORY);
      setUsers(INITIAL_USERS);
      setActiveRole('Admin');
      triggerToast('🔄 Simulador restablecido al estado original con éxito.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800 antialiased overflow-x-hidden">
      
      {/* Toast Alert pop-up */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 max-w-sm bg-slate-900 border-l-4 border-rose-500 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-rose-400">Sistema Digital</h4>
            <p className="text-xs mt-1 font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Sidebar - Matching exactly the dark blue mockup layout with red accents */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 text-slate-300 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out border-r border-slate-900 shadow-xl flex flex-col justify-between`}>
        
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-900/30">
                <Wrench className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-wide uppercase leading-none">MOTO-CONTROL</h1>
                <span className="text-[9px] font-black tracking-widest text-rose-500 block mt-1">SISTEMA DE TALLER</span>
              </div>
            </div>
            
            {/* Mobile close menu */}
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu Group */}
          <div className="p-4 flex flex-col gap-6">
            
            <div>
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block px-3 mb-2.5">
                ROLES EN SIMULACIÓN
              </span>
              
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setActiveRole('Admin');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeRole === 'Admin'
                      ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40'
                      : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    👑 Administrador / Dueño
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => {
                    setActiveRole('Asesor');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeRole === 'Asesor'
                      ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40'
                      : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    👔 Asesor / Recepcionista
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => {
                    setActiveRole('Mecánico');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeRole === 'Mecánico'
                      ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40'
                      : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    🔧 Mecánico / Técnico
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => {
                    setActiveRole('Cliente');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeRole === 'Cliente'
                      ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40'
                      : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    📱 Portal de Cliente
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              </div>
            </div>

            {/* Simulated Live Connection Info */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-900 flex flex-col gap-2 mx-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Flujo de Datos Activo</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Las modificaciones que realices en un rol se reflejarán instantáneamente en los demás paneles.
              </p>
            </div>

          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-900 flex flex-col gap-2">
          <button
            onClick={handleResetDemo}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer border border-slate-800"
          >
            🔄 Reiniciar Simulador
          </button>
          <div className="text-[9px] text-slate-600 text-center font-medium mt-1">
            Moto-Control v2.4 Premium
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Dynamic Top bar header mimicking the screenshot layout */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-rose-500 tracking-wider">PANEL ACTIVO</span>
              <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 mt-0.5">
                {activeRole === 'Admin' && '👑 ADMINISTRADOR GENERAL'}
                {activeRole === 'Asesor' && '👔 ASESOR DE SERVICIO / RECEPCIÓN'}
                {activeRole === 'Mecánico' && '🔧 TÉCNICO MECÁNICO / DIAGNÓSTICOS'}
                {activeRole === 'Cliente' && '📱 PORTAL DIGITAL DEL CLIENTE'}
              </h2>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-4">
            
            {/* Help guidelines badge */}
            <span className="hidden md:flex items-center gap-1 text-[10px] font-extrabold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase">
              <Award className="w-3.5 h-3.5 text-rose-500" /> CDMX Verificación Sincronizada
            </span>

            {/* Notification drop */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-950 text-slate-200 border border-slate-900 rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">Notificaciones Recientes</span>
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-[9px] font-bold text-slate-400 hover:text-white"
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {notifications.map((notif, idx) => (
                      <div key={idx} className="p-2 hover:bg-slate-900 rounded-lg text-[11px] leading-relaxed transition-colors border-b border-slate-900/50">
                        {notif}
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="text-center p-4 text-slate-500 text-xs">
                        No hay notificaciones nuevas.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Simulated User Profile Icon */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                {activeRole === 'Admin' && 'AD'}
                {activeRole === 'Asesor' && 'AS'}
                {activeRole === 'Mecánico' && 'ME'}
                {activeRole === 'Cliente' && 'CL'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {activeRole === 'Admin' && 'Ing. Carlos Ortiz'}
                  {activeRole === 'Asesor' && 'Asesor Alejandro'}
                  {activeRole === 'Mecánico' && 'Mec. Roberto Gómez'}
                  {activeRole === 'Cliente' && 'María Fernanda R.'}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  {activeRole === 'Admin' && 'Súper Admin'}
                  {activeRole === 'Asesor' && 'Asesor Rampa'}
                  {activeRole === 'Mecánico' && 'Bahía 3'}
                  {activeRole === 'Cliente' && 'Propietario'}
                </span>
              </div>
            </div>

          </div>
        </header>

        {/* Main interactive viewport container */}
        <main className="p-6 flex-1 max-w-[1600px] w-full mx-auto">
          {activeRole === 'Asesor' && (
            <AsesorView 
              orders={orders} 
              onAddOrder={handleAddOrder} 
              onUpdateOrder={handleUpdateOrder}
              onSendToast={triggerToast}
            />
          )}

          {activeRole === 'Mecánico' && (
            <MecanicoView 
              orders={orders} 
              onUpdateOrder={handleUpdateOrder} 
              onSendToast={triggerToast}
            />
          )}

          {activeRole === 'Admin' && (
            <AdminView 
              orders={orders} 
              inventory={inventory} 
              users={users}
              onUpdateInventory={setInventory}
              onUpdateUsers={setUsers}
              onUpdateOrder={handleUpdateOrder}
              onSendToast={triggerToast}
            />
          )}

          {activeRole === 'Cliente' && (
            <ClienteView 
              orders={orders} 
              onUpdateOrder={handleUpdateOrder} 
              onSendToast={triggerToast}
            />
          )}
        </main>
      </div>

    </div>
  );
}
