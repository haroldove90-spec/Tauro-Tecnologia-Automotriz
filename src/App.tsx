import { useState, useEffect } from 'react';
import { 
  Wrench, Shield, Users, CreditCard, ChevronRight, Menu, X, 
  Bell, HelpCircle, CheckCircle, Smartphone, Award, ClipboardCheck, Camera 
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    const local = localStorage.getItem('tauro_onboarding_dismissed');
    return local !== 'true';
  });

  // Track if onboarding gets dismissed
  const handleDismissOnboarding = () => {
    localStorage.setItem('tauro_onboarding_dismissed', 'true');
    setShowOnboarding(false);
  };

  // Listen to installation prompts and check camera permission
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      triggerToast('📲 ¡Tauro Tecnología está lista para instalarse en tu dispositivo!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check camera permission
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' as any }).then((permissionStatus) => {
        setCameraPermission(permissionStatus.state);
        permissionStatus.onchange = () => {
          setCameraPermission(permissionStatus.state);
        };
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      triggerToast('ℹ️ Para instalar en iOS, abre el menú de compartir de Safari y selecciona "Agregar a Inicio". En Android o Chrome, si no aparece el aviso, tu navegador ya lo tiene instalado o puedes forzarlo desde el menú del navegador.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      triggerToast('🎉 ¡Gracias por instalar la App de Tauro Tecnología!');
    }
    setDeferredPrompt(null);
  };

  const handleRequestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop tracks immediately to avoid keeping the camera active in background
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      triggerToast('📸 Permiso de cámara concedido con éxito. ¡Ya puedes capturar evidencias!');
    } catch (error) {
      setCameraPermission('denied');
      triggerToast('❌ No se pudo activar la cámara. Revisa la configuración de privacidad de tu dispositivo.');
    }
  };

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
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800 antialiased overflow-x-hidden pb-16 lg:pb-0">
      
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
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 shadow-lg overflow-hidden shrink-0">
                <img 
                  src="https://appdesignproyectos.com//taurologo.png" 
                  alt="Tauro Logo" 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div>
                <h1 className="text-xs font-black text-white tracking-wide uppercase leading-none">TAURO</h1>
                <span className="text-[9px] font-black tracking-widest text-rose-500 block mt-1">TECNOLOGÍA</span>
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
        <header className="bg-white border-b border-slate-200/80 px-4 md:px-6 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src="https://appdesignproyectos.com//taurologo.png" 
                  alt="Tauro Logo" 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-rose-500 tracking-wider">Tauro Tecnología</span>
                <h2 className="text-xs md:text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 mt-0.5">
                  {activeRole === 'Admin' && '👑 ADMINISTRADOR'}
                  {activeRole === 'Asesor' && '👔 ASESOR'}
                  {activeRole === 'Mecánico' && '🔧 TÉCNICO'}
                  {activeRole === 'Cliente' && '📱 CLIENTE'}
                </h2>
              </div>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Camera Permission Quick Trigger */}
            <button
              onClick={handleRequestCameraPermission}
              className={`hidden md:flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-full uppercase transition-all cursor-pointer ${
                cameraPermission === 'granted'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : cameraPermission === 'denied'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
              }`}
              title="Solicitar Permisos de Cámara del Móvil"
            >
              <Camera className={`w-3.5 h-3.5 ${cameraPermission === 'granted' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
              <span>Cámara: {cameraPermission === 'granted' ? 'Permitida' : 'Activar'}</span>
            </button>

            {/* PWA Mobile Installation Button */}
            <button
              onClick={handleInstallApp}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-full uppercase transition-all shadow-md shadow-rose-950/20 cursor-pointer"
              title="Instalar Aplicación Móvil"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar App</span>
              <span className="sm:hidden">Instalar</span>
            </button>

            {/* Help guidelines badge */}
            <span className="hidden xl:flex items-center gap-1 text-[10px] font-extrabold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-full uppercase">
              <Award className="w-3.5 h-3.5 text-rose-500" /> CDMX Sincronizada
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
        <main className="p-4 md:p-6 flex-1 max-w-[1600px] w-full mx-auto">
          
          {/* Tauro PWA & Camera Onboarding Banner */}
          {showOnboarding && (
            <div className="mb-6 bg-slate-950 border border-slate-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-xl">
              {/* Decorative background gradients */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
              
              <button 
                onClick={handleDismissOnboarding}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer bg-slate-900/60"
                title="Cerrar Onboarding"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-2 flex-wrap">
                      ¡Instala la App de Tauro Tecnología! 
                      <span className="bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-normal">Instalación PWA</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed font-medium">
                      Descarga nuestra aplicación móvil oficial para recibir notificaciones en tiempo real, ver la verificación de la CDMX, firmar autorizaciones digitales y capturar evidencias fotográficas directamente desde el taller.
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400">
                        ✓ Icono oficial "Tauro"
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        ✓ Acceso instantáneo
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        ✓ Activación de cámara móvil
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full lg:w-auto">
                  <button
                    onClick={handleRequestCameraPermission}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      cameraPermission === 'granted'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-800'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>
                      {cameraPermission === 'granted' ? 'Cámara Activada' : 'Permitir Cámara'}
                    </span>
                  </button>

                  <button
                    onClick={handleInstallApp}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-500"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Instalar Aplicación</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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

      {/* Bottom Navigation Bar for Mobile & Tablet */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-slate-950 border-t border-slate-900 text-slate-400 z-40 h-16 flex items-center justify-around px-2 shadow-2xl">
        <button
          onClick={() => setActiveRole('Admin')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all cursor-pointer ${
            activeRole === 'Admin' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
          }`}
        >
          <Award className={`w-5 h-5 ${activeRole === 'Admin' ? 'scale-110 text-rose-500' : ''}`} />
          <span className="text-[10px] mt-1 font-bold">Admin</span>
        </button>
        <button
          onClick={() => setActiveRole('Asesor')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all cursor-pointer ${
            activeRole === 'Asesor' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
          }`}
        >
          <ClipboardCheck className={`w-5 h-5 ${activeRole === 'Asesor' ? 'scale-110 text-rose-500' : ''}`} />
          <span className="text-[10px] mt-1 font-bold">Asesor</span>
        </button>
        <button
          onClick={() => setActiveRole('Mecánico')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all cursor-pointer ${
            activeRole === 'Mecánico' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
          }`}
        >
          <Wrench className={`w-5 h-5 ${activeRole === 'Mecánico' ? 'scale-110 text-rose-500' : ''}`} />
          <span className="text-[10px] mt-1 font-bold">Mecánico</span>
        </button>
        <button
          onClick={() => setActiveRole('Cliente')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all cursor-pointer ${
            activeRole === 'Cliente' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
          }`}
        >
          <Smartphone className={`w-5 h-5 ${activeRole === 'Cliente' ? 'scale-110 text-rose-500' : ''}`} />
          <span className="text-[10px] mt-1 font-bold">Cliente</span>
        </button>
      </nav>

    </div>
  );
}
