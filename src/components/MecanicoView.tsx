import React, { useState } from 'react';
import { 
  Wrench, Camera, Play, CheckCircle2, AlertTriangle, ChevronRight, 
  Plus, Settings, Clock, PackageOpen, HelpCircle, FileText, Check 
} from 'lucide-react';
import { ServiceOrder, Evidence, BudgetItem, OrderStatus } from '../types';
import { INITIAL_INVENTORY } from '../data/mockData';
import CameraSimulator from './CameraSimulator';

interface MecanicoViewProps {
  orders: ServiceOrder[];
  onUpdateOrder: (updatedOrder: ServiceOrder) => void;
  onSendToast: (msg: string) => void;
  activeSubTab?: 'tasks' | 'evidence' | 'parts';
  onChangeSubTab?: (tab: 'tasks' | 'evidence' | 'parts') => void;
}

export default function MecanicoView({ 
  orders, 
  onUpdateOrder, 
  onSendToast,
  activeSubTab: propActiveSubTab,
  onChangeSubTab
}: MecanicoViewProps) {
  // Filter only orders that mechanics deal with (not delivered yet)
  const activeAssignments = orders.filter(o => o.status !== 'Entregado');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(activeAssignments[0]?.id || '');
  
  const [localActiveSubTab, setLocalActiveSubTab] = useState<'tasks' | 'evidence' | 'parts'>('tasks');
  const activeSubTab = propActiveSubTab || localActiveSubTab;
  const setActiveSubTab = onChangeSubTab || setLocalActiveSubTab;
  
  // Camera simulation state for Mechanic
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPhotoType, setCameraPhotoType] = useState<'DIAGNOSTICO' | 'REPARACION'>('DIAGNOSTICO');
  const [evidenceDesc, setEvidenceDesc] = useState('');

  // Part request state
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [reqQuantity, setReqQuantity] = useState<number>(1);
  const [customReqDesc, setCustomReqDesc] = useState('');
  const [customReqPrice, setCustomReqPrice] = useState<number>(0);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Status transition helper
  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    
    // Auto sync budget status if status shifts
    let budgetStatus = selectedOrder.budget.status;
    if (newStatus === 'En Reparación' && selectedOrder.budget.status === 'Pendiente de Autorización') {
      budgetStatus = 'Aprobado Total'; // assume auto approval for demo fluidity if mechanic starts repairing, or warn them
    }

    const updatedOrder: ServiceOrder = {
      ...selectedOrder,
      status: newStatus,
      budget: {
        ...selectedOrder.budget,
        status: budgetStatus
      }
    };
    onUpdateOrder(updatedOrder);
    onSendToast(`⚙️ Estatus de Orden ${selectedOrder.id} actualizado a: "${newStatus}"`);
  };

  // Add parts/labor requirement discovered during teardown
  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    let desc = '';
    let price = 0;

    if (selectedInventoryId === 'custom') {
      if (!customReqDesc || customReqPrice <= 0) {
        onSendToast('⚠️ Por favor complete la descripción y el costo del requerimiento adicional.');
        return;
      }
      desc = customReqDesc + ' (Adicional descubierto)';
      price = customReqPrice;
    } else {
      const part = INITIAL_INVENTORY.find(p => p.id === selectedInventoryId);
      if (!part) return;
      desc = `${part.name} (Adicional descubierto)`;
      price = part.price;
    }

    const newItem: BudgetItem = {
      id: `bi-mec-${Date.now()}`,
      description: desc,
      quantity: reqQuantity,
      price: price,
      type: selectedInventoryId === 'custom' ? 'Mano de Obra' : 'Refacción',
      approved: 'pending' // crucial: goes to client for authorization
    };

    const updatedItems = [...selectedOrder.budget.items, newItem];
    const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updatedOrder: ServiceOrder = {
      ...selectedOrder,
      // If we discover something new during repairs/diagnosis, alert client
      status: selectedOrder.status === 'En Reparación' ? 'Esperando Autorización' : selectedOrder.status,
      budget: {
        ...selectedOrder.budget,
        items: updatedItems,
        totalPrice: updatedTotal,
        status: 'Pendiente de Autorización' // client needs to approve this new part
      }
    };

    onUpdateOrder(updatedOrder);
    onSendToast(`📦 Requerimiento "${desc}" cargado a la cotización de ${selectedOrder.clientName}. Esperando aprobación del cliente.`);
    
    // Reset fields
    setSelectedInventoryId('');
    setCustomReqDesc('');
    setCustomReqPrice(0);
    setReqQuantity(1);
  };

  // Handle capture of evidence (DIAGNOSTICO / REPARACION)
  const handleCaptureEvidence = (imageUrl: string) => {
    if (!selectedOrder) return;
    if (!evidenceDesc.trim()) {
      onSendToast('⚠️ Escriba una breve descripción del hallazgo o trabajo antes de guardar.');
      return;
    }

    const newEvidence: Evidence = {
      id: `ev-mec-${Date.now()}`,
      type: cameraPhotoType,
      url: imageUrl,
      description: evidenceDesc,
      createdAt: new Date().toISOString(),
      takenBy: 'Mecánico Roberto Gómez'
    };

    const updatedOrder: ServiceOrder = {
      ...selectedOrder,
      evidences: [...selectedOrder.evidences, newEvidence]
    };

    onUpdateOrder(updatedOrder);
    onSendToast(`📸 Evidencia de tipo "${cameraPhotoType}" guardada con éxito en la Orden ${selectedOrder.id}.`);
    setEvidenceDesc('');
    setShowCamera(false);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. MÓDULO TABLERO DE TRABAJO / TAREAS */}
      {activeSubTab === 'tasks' && (
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
          <div className="bg-slate-800 text-white border border-slate-700 rounded-2xl p-5 shadow flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
              <Wrench className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="text-sm font-extrabold text-white">Tablero de Trabajo (Mecánico)</h3>
                <p className="text-[10px] text-slate-400 font-medium">Lista de vehículos asignados con prioridad</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
              {activeAssignments.map(o => {
                const isSelected = o.id === selectedOrderId;
                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSelectedOrderId(o.id);
                      onSendToast(`🚗 Vehículo ${o.id} seleccionado. Ahora puedes registrar evidencias o solicitar refacciones.`);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                      isSelected 
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md' 
                        : 'bg-slate-900 border-slate-700 hover:bg-slate-750 text-slate-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-xs font-black tracking-wider">{o.id}</span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white text-rose-600' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold mt-1.5 ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                        {o.brand} {o.model} ({o.year})
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-[10px]">
                        <span className={isSelected ? 'text-rose-100' : 'text-slate-400'}>
                          Placas: <span className="font-mono font-bold uppercase">{o.plate}</span>
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 shrink-0 transition-transform ${
                      isSelected ? 'translate-x-1 text-white' : 'text-slate-500 group-hover:translate-x-1'
                    }`} />
                  </button>
                );
              })}

              {activeAssignments.length === 0 && (
                <div className="text-center p-8 text-slate-500 text-xs bg-slate-900/50 rounded-xl border border-slate-800">
                  No hay vehículos en rampa asignados actualmente.
                </div>
              )}
            </div>
          </div>
          
          {selectedOrder && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-slate-700">Vehículo seleccionado actual: <span className="text-rose-600">{selectedOrder.brand} {selectedOrder.model} ({selectedOrder.plate})</span></p>
              <p className="text-[10px] text-slate-400 mt-1">Usa la barra de navegación lateral o inferior para ver sus Evidencias o Solicitar Refacciones.</p>
            </div>
          )}
        </div>
      )}

      {/* 2. MÓDULOS DE OPERACIÓN (EVIDENCIAS O REFACCIONES) */}
      {activeSubTab !== 'tasks' && (
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          {selectedOrder ? (
            <div className="flex flex-col gap-6">
              
              {/* Header Plate block */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Orden Activa de Trabajo
                    </span>
                    <h2 className="text-xl font-black text-slate-800 mt-2 flex items-center gap-2">
                      {selectedOrder.brand} {selectedOrder.model} {selectedOrder.year} 
                      <span className="font-mono text-sm px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-normal">{selectedOrder.plate}</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-bold mt-1">Cliente: {selectedOrder.clientName} | {selectedOrder.clientPhone}</p>
                  </div>

                  {/* Big status update buttons block */}
                  <div className="flex gap-2 flex-wrap bg-slate-100 rounded-xl p-1.5 border border-slate-200">
                    <button
                      onClick={() => handleStatusChange('En Diagnóstico')}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                        selectedOrder.status === 'En Diagnóstico' 
                          ? 'bg-blue-600 text-white shadow' 
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> En Diagnóstico
                    </button>

                    <button
                      onClick={() => handleStatusChange('En Reparación')}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                        selectedOrder.status === 'En Reparación' 
                          ? 'bg-rose-600 text-white shadow' 
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" /> En Reparación
                    </button>

                    <button
                      onClick={() => handleStatusChange('Listo')}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                        selectedOrder.status === 'Listo' 
                          ? 'bg-emerald-600 text-white shadow' 
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terminado
                    </button>
                  </div>
                </div>

                {/* Diagnosis notes left by Advisor */}
                <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1">OBSERVACIONES DEL ASESOR:</div>
                  <p className="text-slate-600 leading-relaxed font-medium">"{selectedOrder.generalObservations || 'Sin comentarios registrados por el asesor de entrada.'}"</p>
                </div>
              </div>

              {/* Sub-tab view: EVIDENCES */}
              {activeSubTab === 'evidence' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-rose-500" />
                      <h3 className="text-sm font-extrabold text-slate-800">Cargar Evidencias Operativas (Transparencia)</h3>
                    </div>
                    {!showCamera && (
                      <button
                        onClick={() => setShowCamera(true)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Nueva Evidencia
                      </button>
                    )}
                  </div>

                  {showCamera && (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-4">
                      <div className="flex gap-2 justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Cargar Nueva Foto</span>
                        <div className="flex gap-1.5 bg-slate-200 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => setCameraPhotoType('DIAGNOSTICO')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                              cameraPhotoType === 'DIAGNOSTICO' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600'
                            }`}
                          >
                            🚨 Diagnóstico (Dañado)
                          </button>
                          <button
                            type="button"
                            onClick={() => setCameraPhotoType('REPARACION')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                              cameraPhotoType === 'REPARACION' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600'
                            }`}
                          >
                            🔧 Reparación (Instalado)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Descripción del Hallazgo / Pieza *</label>
                        <input
                          type="text"
                          required
                          value={evidenceDesc}
                          onChange={e => setEvidenceDesc(e.target.value)}
                          placeholder={cameraPhotoType === 'DIAGNOSTICO' ? 'Ej. Balatas delanteras con desgaste excesivo' : 'Ej. Nuevas balatas instaladas y rectificadas'}
                          className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:border-rose-500 outline-none"
                        />
                      </div>

                      <CameraSimulator 
                        evidenceType={cameraPhotoType}
                        onCapture={handleCaptureEvidence}
                      />

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCamera(false);
                            setEvidenceDesc('');
                          }}
                          className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show active order evidences */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {selectedOrder.evidences.map((ev, i) => (
                      <div key={ev.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-sm flex flex-col justify-between">
                        <div className="relative h-28 bg-slate-100">
                          <img src={ev.url} alt={ev.description} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <span className={`absolute top-1 right-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded text-white shadow ${
                            ev.type === 'RECEPCION' ? 'bg-slate-800/80' :
                            ev.type === 'DIAGNOSTICO' ? 'bg-rose-600/80' : 'bg-emerald-600/80'
                          }`}>
                            {ev.type}
                          </span>
                        </div>
                        <div className="p-2">
                          <p className="text-[10px] text-slate-700 font-bold leading-normal line-clamp-2">{ev.description}</p>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-1 font-mono">{new Date(ev.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab view: PARTS */}
              {activeSubTab === 'parts' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                    <PackageOpen className="w-5 h-5 text-rose-500" />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800">Cargar Requerimientos Adicionales (Desarme)</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Añada refacciones extra del almacén descubiertas durante el diagnóstico para autorización del cliente</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddRequirement} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Seleccionar Refacción del Almacén</label>
                      <select
                        value={selectedInventoryId}
                        onChange={e => setSelectedInventoryId(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 outline-none focus:border-rose-500 bg-slate-50 cursor-pointer font-medium"
                      >
                        <option value="" disabled>Seleccione refacción...</option>
                        {INITIAL_INVENTORY.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} (${item.price.toLocaleString('es-MX')} | Stock: {item.stock})
                          </option>
                        ))}
                        <option value="custom">✍️ Capturar mano de obra o refacción no catalogada...</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={reqQuantity}
                        onChange={e => setReqQuantity(parseInt(e.target.value, 10) || 1)}
                        className="w-full text-xs border border-slate-300 rounded-lg px-2 py-2 outline-none focus:border-rose-500 bg-white font-mono"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!selectedInventoryId}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white text-xs font-bold rounded-lg uppercase flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                      >
                        <Plus className="w-4 h-4" /> Cargar
                      </button>
                    </div>

                    {/* Draw custom inputs if custom selected */}
                    {selectedInventoryId === 'custom' && (
                      <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Descripción del Requerimiento Extra</label>
                          <input
                            type="text"
                            value={customReqDesc}
                            onChange={e => setCustomReqDesc(e.target.value)}
                            placeholder="Ej. Rectificación de cabeza o Junta de culata"
                            className="w-full text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Costo Estimado ($)</label>
                          <input
                            type="number"
                            value={customReqPrice === 0 ? '' : customReqPrice}
                            onChange={e => setCustomReqPrice(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </form>

                  {/* Show active items under pending auth */}
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Presupuesto Actual Cargado:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.budget.items.map((item, idx) => (
                        <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-slate-700">{item.description}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-0.5">
                              <span>Cant: {item.quantity}</span>
                              <span>|</span>
                              <span>${(item.price * item.quantity).toLocaleString('es-MX')}</span>
                            </div>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            item.approved === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            item.approved === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.approved === 'approved' ? 'Aprobado' :
                             item.approved === 'rejected' ? 'Rechazado' : 'Pendiente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs shadow-sm">
              Ninguna rampa seleccionada. Por favor ve al módulo de "Tablero de Trabajo" para seleccionar un vehículo.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
