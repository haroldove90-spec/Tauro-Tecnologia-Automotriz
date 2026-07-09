import { useState, useEffect } from 'react';
import { 
  Wrench, Shield, Users, CreditCard, ChevronRight, Menu, X, 
  Bell, HelpCircle, CheckCircle, Smartphone, Award, ClipboardCheck, Camera, Home,
  LogOut, FileText, Layers, PackageOpen, Clock, TrendingUp
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

  const [activeRole, setActiveRole] = useState<'Home' | 'Asesor' | 'Mecánico' | 'Admin' | 'Cliente'>(() => {
    const local = localStorage.getItem('taller_active_role');
    return (local as any) || 'Home'; // Default to Home screen!
  });

  const [activeAsesorTab, setActiveAsesorTab] = useState<'checkin' | 'quotes' | 'monitor'>('checkin');
  const [activeMecanicoTab, setActiveMecanicoTab] = useState<'tasks' | 'evidence' | 'parts'>('tasks');
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'inventory' | 'users' | 'checkout' | 'audit'>('dashboard');
  const [activeClienteTab, setActiveClienteTab] = useState<'timeline' | 'budget' | 'evidence' | 'cdmx'>('timeline');

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
      {activeRole !== 'Home' && (
        <aside className="hidden lg:flex lg:w-72 bg-[#282829] text-slate-300 border-r border-slate-800 shadow-xl lg:static min-h-screen flex-col justify-between shrink-0">
          
          <div>
            {/* Logo Brand Header */}
            <div className="p-6 border-b border-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://appdesignproyectos.com//taurologo.png" 
                  alt="Tauro Logo" 
                  className="w-10 h-10 object-contain shrink-0" 
                  referrerPolicy="no-referrer" 
                />
                <div>
                  <h1 className="text-xs font-black text-white tracking-wide uppercase leading-none">TAURO</h1>
                  <span className="text-[9px] font-black tracking-widest text-rose-500 block mt-1">TECNOLOGÍA</span>
                </div>
              </div>
            </div>

            {/* Navigation Menu Group for Sub-Tabs */}
            <div className="p-4 flex flex-col gap-6">
              
              {/* Asesor Sub-tabs */}
              {activeRole === 'Asesor' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block px-3 mb-2.5">
                    MÓDULOS ASESOR
                  </span>
                  <button
                    onClick={() => { setActiveAsesorTab('checkin'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeAsesorTab === 'checkin' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ClipboardCheck className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Recepción Vehicular</span>
                  </button>
                  <button
                    onClick={() => { setActiveAsesorTab('quotes'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeAsesorTab === 'quotes' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Cotizar / Presupuesto</span>
                  </button>
                  <button
                    onClick={() => { setActiveAsesorTab('monitor'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeAsesorTab === 'monitor' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Monitor de Rampa</span>
                  </button>
                </div>
              )}

              {/* Mecánico Sub-tabs */}
              {activeRole === 'Mecánico' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block px-3 mb-2.5">
                    MÓDULOS MECÁNICO
                  </span>
                  <button
                    onClick={() => { setActiveMecanicoTab('tasks'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeMecanicoTab === 'tasks' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wrench className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Tablero de Trabajo</span>
                  </button>
                  <button
                    onClick={() => { setActiveMecanicoTab('evidence'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeMecanicoTab === 'evidence' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Cargar Evidencias</span>
                  </button>
                  <button
                    onClick={() => { setActiveMecanicoTab('parts'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeMecanicoTab === 'parts' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <PackageOpen className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Solicitar Refacciones</span>
                  </button>
                </div>
              )}

              {/* Admin Sub-tabs */}
              {activeRole === 'Admin' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block px-3 mb-2.5">
                    MÓDULOS ADMIN
                  </span>
                  <button
                    onClick={() => { setActiveAdminTab('dashboard'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeAdminTab === 'dashboard' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Dashboard de Métricas</span>
                  </button>
                  <button
                    onClick={() => { setActiveAdminTab('inventory'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeAdminTab === 'inventory' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <PackageOpen className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Inventario Almacén</span>
                  </button>
                  <button
                    onClick={() => { setActiveAdminTab('users'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeAdminTab === 'users' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Personal y Accesos</span>
                  </button>
                  <button
                    onClick={() => { setActiveAdminTab('checkout'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeAdminTab === 'checkout' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Caja y Facturas</span>
                  </button>
                  <button
                    onClick={() => { setActiveAdminTab('audit'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeAdminTab === 'audit' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Auditoría CDMX</span>
                  </button>
                </div>
              )}

              {/* Cliente Sub-tabs */}
              {activeRole === 'Cliente' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block px-3 mb-2.5">
                    MÓDULOS CLIENTE
                  </span>
                  <button
                    onClick={() => { setActiveClienteTab('timeline'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeClienteTab === 'timeline' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Estatus de Servicio</span>
                  </button>
                  <button
                    onClick={() => { setActiveClienteTab('budget'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeClienteTab === 'budget' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Ver Presupuesto</span>
                  </button>
                  <button
                    onClick={() => { setActiveClienteTab('evidence'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeClienteTab === 'evidence' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Galería Evidencias</span>
                  </button>
                  <button
                    onClick={() => { setActiveClienteTab('cdmx'); setSidebarOpen(false); }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeClienteTab === 'cdmx' ? 'bg-rose-600 text-white font-extrabold shadow-lg shadow-rose-950/40' : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Award className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Calendario CDMX</span>
                  </button>
                </div>
              )}

              {/* Cerrar Sesión / Regresar a Home button */}
              <button
                onClick={() => {
                  setActiveRole('Home');
                  setSidebarOpen(false);
                }}
                className="w-full text-left py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 mt-4 border-t border-slate-900 pt-4 cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Cerrar Sesión (Salir)</span>
              </button>

            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-900 flex flex-col gap-2 font-sans">
            <button
              onClick={handleResetDemo}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-500 hover:text-white font-bold text-[9px] uppercase rounded-lg transition-all cursor-pointer border border-slate-800"
            >
              🔄 Reiniciar Simulador
            </button>
            <div className="text-[9px] text-slate-600 text-center font-medium mt-1">
              Moto-Control v2.4 Premium
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Dynamic Top bar header mimicking the screenshot layout */}
        {activeRole !== 'Home' && (
          <header className="bg-white border-b border-slate-200/80 px-4 md:px-6 py-3.5 flex items-center justify-between">
            
            <div className="flex items-center gap-2 md:gap-3">
              
              <div className="flex items-center gap-2">
                <img 
                  src="https://appdesignproyectos.com//taurologo.png" 
                  alt="Tauro Logo" 
                  className="w-8 h-8 object-contain shrink-0" 
                  referrerPolicy="no-referrer" 
                />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-rose-500 tracking-wider">Tauro Tecnología</span>
                  <h2 className="text-xs md:text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 mt-0.5">
                    {activeRole === 'Home' && '🏠 INICIO'}
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
              
              {/* Go to Home Button */}
              {activeRole !== 'Home' && (
                <button
                  onClick={() => setActiveRole('Home')}
                  className="flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-black p-2 sm:px-2.5 sm:py-1.5 rounded-full border border-slate-200 uppercase transition-all cursor-pointer"
                  title="Volver al Menú de Inicio"
                >
                  <Home className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Inicio</span>
                </button>
              )}
              
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
                className="flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold p-2 sm:px-2.5 sm:py-1.5 rounded-full uppercase transition-all shadow-md shadow-rose-950/20 cursor-pointer"
                title="Instalar Aplicación Móvil"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar App</span>
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
                  <div className="absolute right-0 mt-2 w-80 bg-[#282829] text-slate-200 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
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
                  {activeRole === 'Home' && 'TT'}
                  {activeRole === 'Admin' && 'AD'}
                  {activeRole === 'Asesor' && 'AS'}
                  {activeRole === 'Mecánico' && 'ME'}
                  {activeRole === 'Cliente' && 'CL'}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {activeRole === 'Home' && 'Tauro Tecnología'}
                    {activeRole === 'Admin' && 'Ing. Carlos Ortiz'}
                    {activeRole === 'Asesor' && 'Asesor Alejandro'}
                    {activeRole === 'Mecánico' && 'Mec. Roberto Gómez'}
                    {activeRole === 'Cliente' && 'María Fernanda R.'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    {activeRole === 'Home' && 'Menú Principal'}
                    {activeRole === 'Admin' && 'Súper Admin'}
                    {activeRole === 'Asesor' && 'Asesor Rampa'}
                    {activeRole === 'Mecánico' && 'Bahía 3'}
                    {activeRole === 'Cliente' && 'Propietario'}
                  </span>
                </div>
              </div>

            </div>
          </header>
        )}

        {/* Main interactive viewport container */}
        <main className="p-4 md:p-6 flex-1 max-w-[1600px] w-full mx-auto">
          
          {activeRole === 'Home' && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] py-6 md:py-12 px-2 md:px-4">
              <div className="bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-8 md:p-12 max-w-4xl w-full text-center flex flex-col items-center gap-8 md:gap-10 relative overflow-hidden">
                
                {/* Brand & Logo Section */}
                <div className="flex flex-col items-center justify-center w-full">
                  <img 
                    src="https://appdesignproyectos.com//taurologo.png" 
                    alt="Tauro Logo" 
                    className="max-w-[280px] md:max-w-[340px] w-full h-auto object-contain transition-transform hover:scale-105 duration-300" 
                    referrerPolicy="no-referrer" 
                  />
                </div>

                {/* The 4 Roles - Icons & Titles ONLY */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  
                  {/* Administrador */}
                  <button
                    onClick={() => setActiveRole('Admin')}
                    className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-2xl transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-[#282829] group-hover:bg-rose-600 text-rose-500 group-hover:text-white rounded-xl flex items-center justify-center mb-3 shadow transition-all duration-300">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black tracking-wide uppercase text-slate-800 group-hover:text-rose-600">
                      Administrador
                    </span>
                  </button>

                  {/* Asesor */}
                  <button
                    onClick={() => setActiveRole('Asesor')}
                    className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-2xl transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-[#282829] group-hover:bg-rose-600 text-rose-500 group-hover:text-white rounded-xl flex items-center justify-center mb-3 shadow transition-all duration-300">
                      <ClipboardCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black tracking-wide uppercase text-slate-800 group-hover:text-rose-600">
                      Asesor
                    </span>
                  </button>

                  {/* Mecánico */}
                  <button
                    onClick={() => setActiveRole('Mecánico')}
                    className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-2xl transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-[#282829] group-hover:bg-rose-600 text-rose-500 group-hover:text-white rounded-xl flex items-center justify-center mb-3 shadow transition-all duration-300">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black tracking-wide uppercase text-slate-800 group-hover:text-rose-600">
                      Mecánico
                    </span>
                  </button>

                  {/* Cliente */}
                  <button
                    onClick={() => setActiveRole('Cliente')}
                    className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-2xl transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-[#282829] group-hover:bg-rose-600 text-rose-500 group-hover:text-white rounded-xl flex items-center justify-center mb-3 shadow transition-all duration-300">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black tracking-wide uppercase text-slate-800 group-hover:text-rose-600">
                      Cliente
                    </span>
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
              activeSubTab={activeAsesorTab}
              onChangeSubTab={setActiveAsesorTab}
            />
          )}

          {activeRole === 'Mecánico' && (
            <MecanicoView 
              orders={orders} 
              onUpdateOrder={handleUpdateOrder} 
              onSendToast={triggerToast}
              activeSubTab={activeMecanicoTab}
              onChangeSubTab={setActiveMecanicoTab}
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
              activeSubTab={activeAdminTab}
              onChangeSubTab={setActiveAdminTab}
            />
          )}

          {activeRole === 'Cliente' && (
            <ClienteView 
              orders={orders} 
              onUpdateOrder={handleUpdateOrder} 
              onSendToast={triggerToast}
              activeSubTab={activeClienteTab}
              onChangeSubTab={setActiveClienteTab}
            />
          )}
        </main>
      </div>

      {/* Bottom Navigation Bar for Mobile & Tablet */}
      {activeRole !== 'Home' && (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#282829] border-t border-slate-800 text-slate-400 z-40 h-16 flex items-center justify-around px-1 shadow-2xl">
          
          {/* Asesor Bottom Navigation */}
          {activeRole === 'Asesor' && (
            <>
              <button
                onClick={() => setActiveAsesorTab('checkin')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeAsesorTab === 'checkin' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <ClipboardCheck className={`w-5 h-5 ${activeAsesorTab === 'checkin' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Recepción</span>
              </button>
              <button
                onClick={() => setActiveAsesorTab('quotes')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeAsesorTab === 'quotes' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <FileText className={`w-5 h-5 ${activeAsesorTab === 'quotes' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Cotizar</span>
              </button>
              <button
                onClick={() => setActiveAsesorTab('monitor')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeAsesorTab === 'monitor' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <Layers className={`w-5 h-5 ${activeAsesorTab === 'monitor' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Rampas</span>
              </button>
            </>
          )}

          {/* Mecánico Bottom Navigation */}
          {activeRole === 'Mecánico' && (
            <>
              <button
                onClick={() => setActiveMecanicoTab('tasks')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeMecanicoTab === 'tasks' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <Wrench className={`w-5 h-5 ${activeMecanicoTab === 'tasks' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Tablero</span>
              </button>
              <button
                onClick={() => setActiveMecanicoTab('evidence')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeMecanicoTab === 'evidence' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <Camera className={`w-5 h-5 ${activeMecanicoTab === 'evidence' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Evidencias</span>
              </button>
              <button
                onClick={() => setActiveMecanicoTab('parts')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeMecanicoTab === 'parts' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <PackageOpen className={`w-5 h-5 ${activeMecanicoTab === 'parts' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Refacciones</span>
              </button>
            </>
          )}

          {/* Admin Bottom Navigation */}
          {activeRole === 'Admin' && (
            <>
              <button
                onClick={() => setActiveAdminTab('dashboard')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeAdminTab === 'dashboard' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <TrendingUp className={`w-5 h-5 ${activeAdminTab === 'dashboard' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Métricas</span>
              </button>
              <button
                onClick={() => setActiveAdminTab('inventory')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeAdminTab === 'inventory' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <PackageOpen className={`w-5 h-5 ${activeAdminTab === 'inventory' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Almacén</span>
              </button>
              <button
                onClick={() => setActiveAdminTab('checkout')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeAdminTab === 'checkout' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${activeAdminTab === 'checkout' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Caja</span>
              </button>
              <button
                onClick={() => setActiveAdminTab('audit')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeAdminTab === 'audit' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <Shield className={`w-5 h-5 ${activeAdminTab === 'audit' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Auditoría</span>
              </button>
            </>
          )}

          {/* Cliente Bottom Navigation */}
          {activeRole === 'Cliente' && (
            <>
              <button
                onClick={() => setActiveClienteTab('timeline')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeClienteTab === 'timeline' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <Clock className={`w-5 h-5 ${activeClienteTab === 'timeline' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Estatus</span>
              </button>
              <button
                onClick={() => setActiveClienteTab('budget')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeClienteTab === 'budget' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <FileText className={`w-5 h-5 ${activeClienteTab === 'budget' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Presupuesto</span>
              </button>
              <button
                onClick={() => setActiveClienteTab('evidence')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeClienteTab === 'evidence' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <Camera className={`w-5 h-5 ${activeClienteTab === 'evidence' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">Evidencias</span>
              </button>
              <button
                onClick={() => setActiveClienteTab('cdmx')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  activeClienteTab === 'cdmx' ? 'text-rose-500 font-extrabold' : 'hover:text-slate-200'
                }`}
              >
                <Award className={`w-5 h-5 ${activeClienteTab === 'cdmx' ? 'scale-110 text-rose-500' : ''}`} />
                <span className="text-[9px] mt-1 font-bold">CDMX</span>
              </button>
            </>
          )}

          {/* Shared Logout Button for Mobile */}
          <button
            onClick={() => setActiveRole('Home')}
            className="flex flex-col items-center justify-center flex-1 h-full py-1.5 hover:text-rose-400 transition-all cursor-pointer border-l border-slate-900"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            <span className="text-[9px] mt-1 font-bold text-rose-500">Salir</span>
          </button>

        </nav>
      )}

    </div>
  );
}
