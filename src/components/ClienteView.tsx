import { useState } from 'react';
import { 
  HeartHandshake, ChevronRight, CheckCircle2, ShieldAlert, FileText, 
  Clock, ThumbsUp, ThumbsDown, Camera, Calendar, AlertCircle, BellRing 
} from 'lucide-react';
import { ServiceOrder, BudgetItem } from '../types';
import VerificationCDMX from './VerificationCDMX';

interface ClienteViewProps {
  orders: ServiceOrder[];
  onUpdateOrder: (updatedOrder: ServiceOrder) => void;
  onSendToast: (msg: string) => void;
}

export default function ClienteView({ orders, onUpdateOrder, onSendToast }: ClienteViewProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Status index for timeline progress
  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Ingresado': return 0;
      case 'En Diagnóstico': return 1;
      case 'Esperando Autorización': return 2;
      case 'En Reparación': return 3;
      case 'Listo': return 4;
      case 'Entregado': return 5;
      default: return 0;
    }
  };

  const steps = [
    { label: 'Ingresado', desc: 'Vehículo recibido en rampa' },
    { label: 'En Diagnóstico', desc: 'Escaneo y revisión por técnico' },
    { label: 'Esperando Autorización', desc: 'Cotización en firma del cliente' },
    { label: 'En Reparación', desc: 'Sustitución e instalación activa' },
    { label: 'Listo', desc: 'Prueba de ruta y lavado finalizado' }
  ];

  const currentStep = selectedOrder ? getStatusStep(selectedOrder.status) : 0;

  // Approve or Reject quote item on behalf of the customer
  const handleItemApproval = (itemId: string, approved: 'approved' | 'rejected') => {
    if (!selectedOrder) return;

    const updatedItems = selectedOrder.budget.items.map(item => {
      if (item.id === itemId) {
        return { ...item, approved };
      }
      return item;
    });

    // Recompute total price of approved items
    const approvedTotal = updatedItems.reduce((sum, item) => sum + (item.approved === 'approved' ? item.price * item.quantity : 0), 0);

    // Calculate budget status
    const allApproved = updatedItems.every(i => i.approved === 'approved');
    const allRejected = updatedItems.every(i => i.approved === 'rejected');
    const budgetStatus = allApproved ? 'Aprobado Total' : allRejected ? 'Rechazado' : 'Aprobado Parcial';

    // Transition vehicle status based on budget action
    let nextVehicleStatus = selectedOrder.status;
    if (budgetStatus === 'Aprobado Total' || budgetStatus === 'Aprobado Parcial') {
      nextVehicleStatus = 'En Reparación'; // automatically unlock mechanic work
    }

    const updatedOrder: ServiceOrder = {
      ...selectedOrder,
      status: nextVehicleStatus,
      budget: {
        ...selectedOrder.budget,
        items: updatedItems,
        totalPrice: selectedOrder.budget.totalPrice, // maintain original quote total for breakdown comparison
        status: budgetStatus
      }
    };

    onUpdateOrder(updatedOrder);
    onSendToast(
      approved === 'approved'
        ? `✅ Concepto aprobado. Se ha notificado al mecánico para iniciar reparación.`
        : `❌ Concepto rechazado. Cotización actualizada.`
    );
  };

  const handleBulkApproval = (approved: 'approved' | 'rejected') => {
    if (!selectedOrder) return;

    const updatedItems = selectedOrder.budget.items.map(item => ({
      ...item,
      approved
    }));

    const budgetStatus = approved === 'approved' ? 'Aprobado Total' : 'Rechazado';
    let nextVehicleStatus = selectedOrder.status;
    if (approved === 'approved') {
      nextVehicleStatus = 'En Reparación';
    }

    const updatedOrder: ServiceOrder = {
      ...selectedOrder,
      status: nextVehicleStatus,
      budget: {
        ...selectedOrder.budget,
        items: updatedItems,
        status: budgetStatus
      }
    };

    onUpdateOrder(updatedOrder);
    onSendToast(
      approved === 'approved'
        ? `🎉 ¡Presupuesto completo aprobado con un toque! Desbloqueando asignaciones del mecánico.`
        : `⚠️ Presupuesto rechazado por el cliente. Avisando al asesor de rampa.`
    );
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Selector for Demo Simulation */}
      <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-2.5">
          <HeartHandshake className="w-5 h-5 text-rose-500" />
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">PORTAL DE SEGUIMIENTO AL CLIENTE</h3>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">Simula lo que ve tu cliente en su teléfono móvil</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-bold">Ver el auto de:</span>
          <select
            value={selectedOrderId}
            onChange={e => setSelectedOrderId(e.target.value)}
            className="text-xs border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-500 bg-slate-800 text-white font-bold cursor-pointer"
          >
            {orders.map(o => (
              <option key={o.id} value={o.id}>
                {o.clientName} ({o.brand} {o.model})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedOrder ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Timeline and Budget Approval Column */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            
            {/* 1. Real-time Status Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" /> Progreso de su Vehículo en Tiempo Real
              </h3>

              {/* Progress Bar Timeline UI */}
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 py-4 px-2">
                
                {/* Horizontal line connector */}
                <div className="absolute top-[34px] left-8 right-8 h-1 bg-slate-100 hidden md:block -z-0" />
                <div 
                  className="absolute top-[34px] left-8 h-1 bg-emerald-500 hidden md:block transition-all duration-500 -z-0" 
                  style={{ width: `${(Math.min(currentStep, 4) / 4) * 100}%` }}
                />

                {steps.map((st, i) => {
                  const isCompleted = i < currentStep;
                  const isActive = i === currentStep;
                  return (
                    <div key={i} className="flex md:flex-col items-center md:text-center gap-3 md:gap-2 flex-1 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : isActive 
                            ? 'bg-white border-rose-500 text-rose-600 shadow-md shadow-rose-100 ring-4 ring-rose-50' 
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 font-black" />
                        ) : (
                          <span className="font-mono font-black text-xs">{i + 1}</span>
                        )}
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${
                          isCompleted ? 'text-slate-800' : isActive ? 'text-rose-600 font-extrabold' : 'text-slate-400'
                        }`}>
                          {st.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5 md:max-w-[120px] md:mx-auto block">
                          {st.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ready Notification Alert Banner */}
              {selectedOrder.status === 'Listo' && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 animate-bounce">
                  <BellRing className="w-5 h-5 text-emerald-600 animate-swing" />
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-800">¡Su vehículo está Listo para Entrega!</h4>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">El servicio y pruebas de control de calidad han finalizado con éxito. Ya puede acudir a ventanilla por él.</p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Budget Approval breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 mb-5 gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-500" />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Presupuestos y Aprobación Digital</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Inspeccione costos detallados y autorice en un solo toque</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Estado de Presupuesto:</span>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                    selectedOrder.budget.status === 'Aprobado Total' ? 'bg-emerald-100 text-emerald-800' :
                    selectedOrder.budget.status === 'Pendiente de Autorización' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    selectedOrder.budget.status === 'Sin Cotizar' ? 'bg-slate-100 text-slate-400' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedOrder.budget.status}
                  </span>
                </div>
              </div>

              {selectedOrder.budget.items.length > 0 ? (
                <div className="flex flex-col gap-5">
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px]">
                          <th className="py-3 px-4">Concepto</th>
                          <th className="py-3 px-3 text-center">Tipo</th>
                          <th className="py-3 px-3 text-right">Cant.</th>
                          <th className="py-3 px-3 text-right">Precio Unitario</th>
                          <th className="py-3 px-3 text-right">Subtotal</th>
                          <th className="py-3 px-4 text-center">Autorizar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.budget.items.map(item => (
                          <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-700">{item.description}</span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                                item.type === 'Mano de Obra' ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-600">{item.quantity}</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-600">${item.price.toLocaleString('es-MX')}</td>
                            <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-800">${(item.price * item.quantity).toLocaleString('es-MX')}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleItemApproval(item.id, 'approved')}
                                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                    item.approved === 'approved' 
                                      ? 'bg-emerald-500 text-white' 
                                      : 'bg-slate-100 hover:bg-emerald-100 text-slate-400 hover:text-emerald-600'
                                  }`}
                                  title="Aprobar"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleItemApproval(item.id, 'rejected')}
                                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                    item.approved === 'rejected' 
                                      ? 'bg-rose-500 text-white' 
                                      : 'bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600'
                                  }`}
                                  title="Rechazar"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom pricing blocks */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Monto Total Estimado</span>
                      <span className="text-xl font-black text-rose-600 font-mono">${selectedOrder.budget.totalPrice.toLocaleString('es-MX')}</span>
                    </div>

                    {/* Bulk Accept / Decline Buttons */}
                    {selectedOrder.budget.status === 'Pendiente de Autorización' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBulkApproval('rejected')}
                          className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer bg-white"
                        >
                          Rechazar Todo
                        </button>
                        <button
                          onClick={() => handleBulkApproval('approved')}
                          className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Aprobar Presupuesto Entero
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-400 text-xs">
                  Su auto está en fase de diagnóstico inicial. Próximamente el asesor cargará un presupuesto para su revisión.
                </div>
              )}
            </div>
          </div>

          {/* Verification Calendar and Evidence Carousel */}
          <div className="flex flex-col gap-6">
            
            {/* CDMX Verification Schedule Widget */}
            <VerificationCDMX 
              plate={selectedOrder.plate} 
              onSendAlert={(msg) => {
                onSendToast(msg);
              }} 
            />

            {/* Evidences Carousel / Sections */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <Camera className="w-5 h-5 text-rose-500" />
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Galería de Evidencias</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Inspección transparente de reparaciones</p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {/* Advisor Reception Photos */}
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">📸 Inventario Inicial (Asesor):</span>
                  {selectedOrder.evidences.filter(e => e.type === 'RECEPCION').length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedOrder.evidences.filter(e => e.type === 'RECEPCION').map(ev => (
                        <div key={ev.id} className="relative rounded-lg overflow-hidden h-20 border border-slate-200 group bg-slate-50">
                          <img src={ev.url} alt="recep" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 flex items-end">
                            <p className="text-[9px] text-white leading-normal line-clamp-2">{ev.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 block italic">Sin imágenes de recepción.</span>
                  )}
                </div>

                {/* Mechanic Diagnosis Photos */}
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block mb-2">🚨 Hallazgos y Desgaste (Mecánico):</span>
                  {selectedOrder.evidences.filter(e => e.type === 'DIAGNOSTICO').length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedOrder.evidences.filter(e => e.type === 'DIAGNOSTICO').map(ev => (
                        <div key={ev.id} className="relative rounded-lg overflow-hidden h-20 border border-slate-200 group bg-slate-50">
                          <img src={ev.url} alt="diag" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 flex items-end">
                            <p className="text-[9px] text-white leading-normal line-clamp-2">{ev.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 block italic">Ninguna foto de falla cargada aún.</span>
                  )}
                </div>

                {/* Mechanic Repair Photos */}
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block mb-2">🔧 Trabajo Finalizado (Mecánico):</span>
                  {selectedOrder.evidences.filter(e => e.type === 'REPARACION').length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedOrder.evidences.filter(e => e.type === 'REPARACION').map(ev => (
                        <div key={ev.id} className="relative rounded-lg overflow-hidden h-20 border border-slate-200 group bg-slate-50">
                          <img src={ev.url} alt="rep" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 flex items-end">
                            <p className="text-[9px] text-white leading-normal line-clamp-2">{ev.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 block italic">Ninguna foto de refacción instalada aún.</span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs shadow-sm">
          No hay órdenes registradas. Visita la pestaña de Asesor para crear tu primera orden.
        </div>
      )}

    </div>
  );
}
