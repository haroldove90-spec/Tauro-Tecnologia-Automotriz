import React, { useState } from 'react';
import { 
  Plus, Check, Sparkles, ClipboardList, PenTool, Camera, CheckSquare, 
  Search, ShieldCheck, ShoppingCart, UserCheck, Eye, Trash2, Send, FileText 
} from 'lucide-react';
import { ServiceOrder, BudgetItem, OrderStatus } from '../types';
import { SERVICES_EXPRES, INITIAL_INVENTORY } from '../data/mockData';
import SignatureCanvas from './SignatureCanvas';
import CameraSimulator from './CameraSimulator';

interface AsesorViewProps {
  orders: ServiceOrder[];
  onAddOrder: (newOrder: ServiceOrder) => void;
  onUpdateOrder: (updatedOrder: ServiceOrder) => void;
  onSendToast: (msg: string) => void;
}

export default function AsesorView({ orders, onAddOrder, onUpdateOrder, onSendToast }: AsesorViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'checkin' | 'quotes' | 'monitor'>('checkin');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // New vehicle registration state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  
  // Checklist State
  const [gasLevel, setGasLevel] = useState<number>(50);
  const [hasSpareTire, setHasSpareTire] = useState(true);
  const [hasJack, setHasJack] = useState(true);
  const [hasTools, setHasTools] = useState(true);
  const [hasExtinguisher, setHasExtinguisher] = useState(false);
  const [generalObservations, setGeneralObservations] = useState('');
  
  // Evidence / Camera State
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [activePhotoType, setActivePhotoType] = useState<string>('RECEPCION');
  
  // Signature State
  const [clientSignature, setClientSignature] = useState<string>('');

  // Selected Order for Cotizaciones
  const [selectedQuoteOrderId, setSelectedQuoteOrderId] = useState<string>(orders[0]?.id || '');
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState<number>(0);
  const [customItemType, setCustomItemType] = useState<'Mano de Obra' | 'Refacción'>('Mano de Obra');
  const [customItemQty, setCustomItemQty] = useState<number>(1);

  // Filter orders by search
  const filteredOrders = orders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedQuoteOrder = orders.find(o => o.id === selectedQuoteOrderId);

  // Handle vehicle registration submit
  const handleRegisterVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !plate || !brand || !model) {
      onSendToast('⚠️ Por favor complete los datos obligatorios (Nombre, Placa, Marca, Modelo)');
      return;
    }
    if (!clientSignature) {
      onSendToast('⚠️ El cliente debe firmar la orden antes de continuar');
      return;
    }

    const orderId = `OS-${1000 + orders.length + 1}`;
    
    // Assemble evidence array
    const evidences = capturedPhotos.map((photo, i) => ({
      id: `ev-new-${Date.now()}-${i}`,
      type: 'RECEPCION' as const,
      url: photo,
      description: `Foto de Recepción ${i + 1} - Estado general`,
      createdAt: new Date().toISOString(),
      takenBy: 'Asesor Alejandro Solís'
    }));

    const newOrder: ServiceOrder = {
      id: orderId,
      clientName,
      clientPhone,
      plate: plate.toUpperCase(),
      vin: vin.toUpperCase() || 'SIN_VIN_' + Date.now(),
      brand,
      model,
      year,
      status: 'Ingresado',
      entryDate: new Date().toISOString(),
      gasLevel,
      hasSpareTire,
      hasJack,
      hasTools,
      hasExtinguisher,
      generalObservations,
      clientSignature,
      evidences,
      budget: {
        items: [],
        totalPrice: 0,
        status: 'Sin Cotizar'
      }
    };

    onAddOrder(newOrder);
    onSendToast(`✅ Orden ${orderId} creada con éxito y enviada a diagnóstico.`);
    
    // Clear check-in form
    setClientName('');
    setClientPhone('');
    setPlate('');
    setVin('');
    setBrand('');
    setModel('');
    setYear(new Date().getFullYear());
    setGasLevel(50);
    setHasSpareTire(true);
    setHasJack(true);
    setHasTools(true);
    setHasExtinguisher(false);
    setGeneralObservations('');
    setCapturedPhotos([]);
    setClientSignature('');
    
    // Auto switch tab to quotes for immediate action
    setSelectedQuoteOrderId(orderId);
    setActiveSubTab('quotes');
  };

  const addExpressServiceToQuote = (serviceName: string, price: number) => {
    if (!selectedQuoteOrder) return;
    
    const newItem: BudgetItem = {
      id: `bi-${Date.now()}`,
      description: serviceName,
      quantity: 1,
      price,
      type: 'Mano de Obra',
      approved: 'pending'
    };

    const updatedItems = [...selectedQuoteOrder.budget.items, newItem];
    const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updatedOrder: ServiceOrder = {
      ...selectedQuoteOrder,
      budget: {
        ...selectedQuoteOrder.budget,
        items: updatedItems,
        totalPrice: updatedTotal,
        status: 'Pendiente de Autorización'
      }
    };

    onUpdateOrder(updatedOrder);
    onSendToast(`🛒 Servicio "${serviceName}" añadido a la cotización.`);
  };

  const addCustomItemToQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuoteOrder || !customItemDesc || customItemPrice <= 0) return;

    const newItem: BudgetItem = {
      id: `bi-${Date.now()}`,
      description: customItemDesc,
      quantity: customItemQty,
      price: customItemPrice,
      type: customItemType,
      approved: 'pending'
    };

    const updatedItems = [...selectedQuoteOrder.budget.items, newItem];
    const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updatedOrder: ServiceOrder = {
      ...selectedQuoteOrder,
      budget: {
        ...selectedQuoteOrder.budget,
        items: updatedItems,
        totalPrice: updatedTotal,
        status: 'Pendiente de Autorización'
      }
    };

    onUpdateOrder(updatedOrder);
    setCustomItemDesc('');
    setCustomItemPrice(0);
    setCustomItemQty(1);
    onSendToast(`🛒 Elemento "${customItemDesc}" añadido con éxito.`);
  };

  const deleteQuoteItem = (itemId: string) => {
    if (!selectedQuoteOrder) return;

    const updatedItems = selectedQuoteOrder.budget.items.filter(item => item.id !== itemId);
    const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updatedOrder: ServiceOrder = {
      ...selectedQuoteOrder,
      budget: {
        ...selectedQuoteOrder.budget,
        items: updatedItems,
        totalPrice: updatedTotal,
        status: updatedItems.length === 0 ? 'Sin Cotizar' : 'Pendiente de Autorización'
      }
    };

    onUpdateOrder(updatedOrder);
    onSendToast(`🗑️ Elemento eliminado de la cotización.`);
  };

  const handleSendQuoteToClient = () => {
    if (!selectedQuoteOrder) return;
    
    // Simulate sending WhatsApp
    const messageText = `Hola ${selectedQuoteOrder.clientName}, tu presupuesto para el vehículo ${selectedQuoteOrder.brand} ${selectedQuoteOrder.model} (${selectedQuoteOrder.plate}) está listo por un total de $${selectedQuoteOrder.budget.totalPrice.toLocaleString('es-MX')}. Puedes revisarlo y autorizarlo aquí en tu panel digital.`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${selectedQuoteOrder.clientPhone.replace(/\s+/g, '')}&text=${encodeURIComponent(messageText)}`;
    
    onSendToast(`📲 Presupuesto enviado digitalmente a ${selectedQuoteOrder.clientName}. (Simulación WhatsApp ejecutada)`);
    
    // Trigger window.open safely within environment limits or inform user
    console.log("WhatsApp Send link triggered: ", whatsappUrl);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Sub tabs header */}
      <div className="flex bg-slate-100 rounded-xl p-1 self-start">
        <button
          onClick={() => setActiveSubTab('checkin')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'checkin' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🚙 Check-In Vehicular
        </button>
        <button
          onClick={() => setActiveSubTab('quotes')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'quotes' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          💰 Presupuestos / Costos
        </button>
        <button
          onClick={() => setActiveSubTab('monitor')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'monitor' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📊 Monitoreo de Autorizaciones
        </button>
      </div>

      {/* SUBTAB 1: CHECK-IN VEHICULAR */}
      {activeSubTab === 'checkin' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main Registration Form */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                <ClipboardList className="w-5 h-5 text-rose-500" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Nueva Recepción en Rampa</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Asesor de Servicio: Registro ágil a un costado del auto</p>
                </div>
              </div>

              <form onSubmit={handleRegisterVehicle} className="flex flex-col gap-5">
                
                {/* 1. Datos del Cliente y Vehículo */}
                <div>
                  <span className="text-[11px] font-black text-rose-500 uppercase tracking-wider block mb-3">1. Datos del Cliente y Vehículo</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Nombre Completo del Cliente *</label>
                      <input 
                        type="text" 
                        required 
                        value={clientName} 
                        onChange={e => setClientName(e.target.value)}
                        placeholder="Ej. María Fernanda Ruiz"
                        className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white focus:border-rose-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Celular del Cliente (WhatsApp) *</label>
                      <input 
                        type="tel" 
                        required
                        value={clientPhone} 
                        onChange={e => setClientPhone(e.target.value)}
                        placeholder="Ej. 55 1234 5678"
                        className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white focus:border-rose-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Placas del Auto *</label>
                      <input 
                        type="text" 
                        required
                        value={plate} 
                        onChange={e => setPlate(e.target.value)}
                        placeholder="Ej. 824-CDX"
                        className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white focus:border-rose-500 outline-none uppercase font-mono tracking-wider"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Número de Serie (VIN)</label>
                      <input 
                        type="text" 
                        value={vin} 
                        onChange={e => setVin(e.target.value)}
                        placeholder="Ej. 1HGCR2F8XHA012345"
                        className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white focus:border-rose-500 outline-none uppercase font-mono tracking-wider"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:col-span-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Marca *</label>
                        <input 
                          type="text" 
                          required
                          value={brand} 
                          onChange={e => setBrand(e.target.value)}
                          placeholder="Ej. Honda"
                          className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white focus:border-rose-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Modelo *</label>
                        <input 
                          type="text" 
                          required
                          value={model} 
                          onChange={e => setModel(e.target.value)}
                          placeholder="Ej. Civic"
                          className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white focus:border-rose-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Año</label>
                        <input 
                          type="number" 
                          value={year} 
                          onChange={e => setYear(parseInt(e.target.value, 10))}
                          className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white focus:border-rose-500 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Inventario Visual y Checklist */}
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-[11px] font-black text-rose-500 uppercase tracking-wider block mb-3">2. Inventario de Recepción</span>
                  
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Nivel de Combustible ({gasLevel}%)</label>
                      <div className="flex gap-2">
                        {[0, 25, 50, 75, 100].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setGasLevel(val)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              gasLevel === val 
                                ? 'bg-slate-800 text-white border-slate-800' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {val === 0 ? 'Vacío' : val === 100 ? 'Lleno' : `${val}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={hasSpareTire} 
                          onChange={e => setHasSpareTire(e.target.checked)}
                          className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4"
                        />
                        <span className="font-semibold text-slate-700">Llanta de Refacción</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={hasJack} 
                          onChange={e => setHasJack(e.target.checked)}
                          className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4"
                        />
                        <span className="font-semibold text-slate-700">Gato Hidráulico</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={hasTools} 
                          onChange={e => setHasTools(e.target.checked)}
                          className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4"
                        />
                        <span className="font-semibold text-slate-700">Herramientas</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={hasExtinguisher} 
                          onChange={e => setHasExtinguisher(e.target.checked)}
                          className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4"
                        />
                        <span className="font-semibold text-slate-700">Extinguidor</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Observaciones / Detalles Estéticos o Fallas</label>
                      <textarea
                        value={generalObservations}
                        onChange={e => setGeneralObservations(e.target.value)}
                        placeholder="Ej. Golpe menor en salpicadera derecha. Rechinido en suspensión delantera."
                        rows={3}
                        className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white focus:border-rose-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Firma Digital */}
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-[11px] font-black text-rose-500 uppercase tracking-wider block mb-3">3. Aceptación del Cliente (Firma)</span>
                  <SignatureCanvas 
                    onSave={(sig) => setClientSignature(sig)} 
                    onClear={() => setClientSignature('')}
                  />
                  <div className="flex gap-2 p-2 bg-slate-50 border border-slate-100 text-[10px] text-slate-500 mt-2 rounded">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    <span>La firma certifica la entrega del vehículo en las condiciones declaradas y autoriza el diagnóstico inicial.</span>
                  </div>
                </div>

                {/* Submit Order */}
                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white uppercase rounded-xl transition-all shadow flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Crear Orden de Servicio Original
                </button>
              </form>
            </div>
          </div>

          {/* Interactive Camera Column for initial evidence */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-rose-500" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">EVIDENCIAS DE RECEPCIÓN</h3>
                </div>
                {capturedPhotos.length > 0 && (
                  <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {capturedPhotos.length} Fotos
                  </span>
                )}
              </div>

              <div className="mb-4">
                <CameraSimulator 
                  evidenceType="RECEPCION"
                  onCapture={(url) => {
                    setCapturedPhotos([...capturedPhotos, url]);
                    onSendToast('📸 Foto de Recepción guardada correctamente.');
                  }}
                />
              </div>

              {capturedPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {capturedPhotos.map((url, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-50">
                      <img src={url} alt={`recepcion-${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        type="button"
                        onClick={() => setCapturedPhotos(capturedPhotos.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 cursor-pointer shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-xs mt-2">
                  Ninguna foto obligatoria adjuntada aún. Captura el estado de los 4 lados del vehículo.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PRESUPUESTOS Y COTIZACIONES */}
      {activeSubTab === 'quotes' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* List of Orders and Quote Creator */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 mb-5 gap-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-rose-500" />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Generador de Costos y Cotizaciones</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Asignación de costos fijos o mano de obra detallada</p>
                  </div>
                </div>
                
                {/* Order Selector */}
                <select 
                  value={selectedQuoteOrderId}
                  onChange={e => setSelectedQuoteOrderId(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-500 bg-slate-50 font-medium cursor-pointer"
                >
                  <option value="" disabled>Seleccione una orden...</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} - {o.clientName} ({o.brand} {o.model})</option>
                  ))}
                </select>
              </div>

              {selectedQuoteOrder ? (
                <div className="flex flex-col gap-6">
                  
                  {/* Selected order summary badge */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-800">{selectedQuoteOrder.id}</span>
                        <span className="px-2 py-0.5 text-[9px] bg-slate-200 font-bold rounded text-slate-700">{selectedQuoteOrder.status}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-600 mt-1">Cliente: {selectedQuoteOrder.clientName} | Placas: <span className="font-mono">{selectedQuoteOrder.plate}</span></h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Total de Cotización</span>
                      <span className="text-base font-black text-rose-600 font-mono">${selectedQuoteOrder.budget.totalPrice.toLocaleString('es-MX')}</span>
                    </div>
                  </div>

                  {/* Add manual item */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/30">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase mb-3 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-rose-500" /> Añadir Desglose Manual
                    </h4>
                    <form onSubmit={addCustomItemToQuote} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Descripción de refacción o labor</label>
                        <input
                          type="text"
                          required
                          value={customItemDesc}
                          onChange={e => setCustomItemDesc(e.target.value)}
                          placeholder="Ej. Balatas delanteras o Rectificado de discos"
                          className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:border-rose-500 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Tipo</label>
                        <select
                          value={customItemType}
                          onChange={e => setCustomItemType(e.target.value as any)}
                          className="w-full text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:border-rose-500 outline-none bg-white cursor-pointer"
                        >
                          <option value="Mano de Obra">Mano de Obra</option>
                          <option value="Refacción">Refacción</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Costo Unitario ($)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={customItemPrice === 0 ? '' : customItemPrice}
                          onChange={e => setCustomItemPrice(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:border-rose-500 outline-none bg-white font-mono"
                        />
                      </div>
                      <div className="md:col-span-4 flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" /> Agregar Elemento
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Quote Items Table */}
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase mb-2">Desglose Actual de la Cotización</h4>
                    {selectedQuoteOrder.budget.items.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px]">
                              <th className="py-3 px-4">Concepto</th>
                              <th className="py-3 px-3 text-center">Tipo</th>
                              <th className="py-3 px-3 text-right">Cant.</th>
                              <th className="py-3 px-3 text-right">P. Unitario</th>
                              <th className="py-3 px-3 text-right">Subtotal</th>
                              <th className="py-3 px-3 text-center">Estatus</th>
                              <th className="py-3 px-4 text-center">Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedQuoteOrder.budget.items.map((item, idx) => (
                              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-700">{item.description}</td>
                                <td className="py-3 px-3 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                                    item.type === 'Mano de Obra' ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'
                                  }`}>
                                    {item.type}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">{item.quantity}</td>
                                <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">${item.price.toLocaleString('es-MX')}</td>
                                <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-800">${(item.price * item.quantity).toLocaleString('es-MX')}</td>
                                <td className="py-3 px-3 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                    item.approved === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                    item.approved === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {item.approved === 'approved' ? 'Aprobado' :
                                     item.approved === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => deleteQuoteItem(item.id)}
                                    className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center p-8 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                        Esta cotización no tiene elementos aún. Añada servicios exprés del catálogo lateral o desglose mano de obra manual.
                      </div>
                    )}
                  </div>

                  {/* Send Action */}
                  {selectedQuoteOrder.budget.items.length > 0 && (
                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        onClick={handleSendQuoteToClient}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" /> Enviar Presupuesto Completo por WhatsApp
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center p-12 text-slate-400 text-xs">
                  Seleccione una orden de servicio arriba para comenzar a cotizar.
                </div>
              )}
            </div>
          </div>

          {/* Quick Add Express Services Catalogue sidebar */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">SERVICIOS EXPRÉS (PRECIO FIJO)</h3>
              </div>

              <div className="flex flex-col gap-3">
                {SERVICES_EXPRES.map((svc) => (
                  <div 
                    key={svc.id}
                    className="border border-slate-100 rounded-xl p-3 bg-slate-50/30 hover:bg-slate-50 transition-colors flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">{svc.name}</h4>
                        <span className="font-mono text-xs font-black text-rose-600 shrink-0">${svc.price}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">{svc.description}</p>
                    </div>

                    <button
                      type="button"
                      disabled={!selectedQuoteOrder}
                      onClick={() => addExpressServiceToQuote(svc.name, svc.price)}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-[10px] uppercase rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Añadir a Presupuesto
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: MONITOREO DE AUTORIZACIONES */}
      {activeSubTab === 'monitor' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Monitoreo de Autorizaciones en Tiempo Real</h3>
                <p className="text-[10px] text-slate-500 font-medium">Panel de control de aprobaciones por los clientes</p>
              </div>
            </div>
            
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text"
                placeholder="Buscar por placa, cliente..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px]">
                  <th className="py-3 px-4">Orden</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-3">Placas</th>
                  <th className="py-3 px-3">Estatus Auto</th>
                  <th className="py-3 px-3 text-right">Total Presupuestado</th>
                  <th className="py-3 px-4 text-center">Estatus Cotización</th>
                  <th className="py-3 px-4 text-center">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{o.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-700 leading-tight">{o.clientName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{o.clientPhone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold uppercase text-slate-600">{o.plate}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        o.status === 'Ingresado' ? 'bg-slate-100 text-slate-800' :
                        o.status === 'En Diagnóstico' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        o.status === 'Esperando Autorización' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                        o.status === 'En Reparación' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-800">${o.budget.totalPrice.toLocaleString('es-MX')}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        o.budget.status === 'Aprobado Total' ? 'bg-emerald-100 text-emerald-800' :
                        o.budget.status === 'Pendiente de Autorización' ? 'bg-amber-100 text-amber-800' :
                        o.budget.status === 'Sin Cotizar' ? 'bg-slate-100 text-slate-400' : 'bg-red-100 text-red-800'
                      }`}>
                        {o.budget.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedQuoteOrderId(o.id);
                            setActiveSubTab('quotes');
                          }}
                          className="px-2 py-1 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded text-[10px] font-bold flex items-center gap-1 bg-white cursor-pointer"
                        >
                          <FileText className="w-3 h-3" /> Ver Cotización
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center p-8 text-slate-400 text-xs">
                No se encontraron órdenes con los términos de búsqueda especificados.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
