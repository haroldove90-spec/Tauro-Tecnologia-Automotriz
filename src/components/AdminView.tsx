import React, { useState } from 'react';
import { 
  Building2, Users, ShoppingBag, CreditCard, Eye, Plus, Edit2, CheckCircle, 
  Trash2, ToggleLeft, ToggleRight, DollarSign, Package, Check, Award 
} from 'lucide-react';
import { ServiceOrder, PartInventory, User, OrderStatus } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import AdminDashboardView from './AdminDashboardView';

interface AdminViewProps {
  orders: ServiceOrder[];
  inventory: PartInventory[];
  users: User[];
  onUpdateInventory: (updatedInv: PartInventory[]) => void;
  onUpdateUsers: (updatedUsers: User[]) => void;
  onUpdateOrder: (updatedOrder: ServiceOrder) => void;
  onSendToast: (msg: string) => void;
  activeSubTab?: 'dashboard' | 'inventory' | 'users' | 'checkout' | 'audit';
  onChangeSubTab?: (tab: 'dashboard' | 'inventory' | 'users' | 'checkout' | 'audit') => void;
}

export default function AdminView({ 
  orders, 
  inventory, 
  users, 
  onUpdateInventory, 
  onUpdateUsers, 
  onUpdateOrder, 
  onSendToast,
  activeSubTab: externalActiveSubTab,
  onChangeSubTab: externalOnChangeSubTab
}: AdminViewProps) {
  const [internalActiveSubTab, setInternalActiveSubTab] = useState<'dashboard' | 'inventory' | 'users' | 'checkout' | 'audit'>('dashboard');
  
  const activeSubTab = externalActiveSubTab !== undefined ? externalActiveSubTab : internalActiveSubTab;
  const setActiveSubTab = (tab: 'dashboard' | 'inventory' | 'users' | 'checkout' | 'audit') => {
    if (externalOnChangeSubTab) {
      externalOnChangeSubTab(tab);
    } else {
      setInternalActiveSubTab(tab);
    }
  };

  // Almacén / Price Nutridor state
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  
  // New part state
  const [newPartName, setNewPartName] = useState('');
  const [newPartCost, setNewPartCost] = useState<number>(0);
  const [newPartPrice, setNewPartPrice] = useState<number>(0);
  const [newPartStock, setNewPartStock] = useState<number>(0);

  // New user state
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Asesor' | 'Mecánico' | 'Admin'>('Asesor');

  // Checkout and billing state
  const [selectedCheckoutOrderId, setSelectedCheckoutOrderId] = useState<string>(
    orders.filter(o => o.status === 'Listo')[0]?.id || orders[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');

  // Audit selected order state
  const [selectedAuditOrderId, setSelectedAuditOrderId] = useState<string>(orders[0]?.id || '');

  const selectedCheckoutOrder = orders.find(o => o.id === selectedCheckoutOrderId);
  const selectedAuditOrder = orders.find(o => o.id === selectedAuditOrderId);

  // Inventario / Almacén actions
  const handleSaveInventoryEdit = (id: string) => {
    const updated = inventory.map(item => {
      if (item.id === id) {
        return { ...item, price: editPrice, stock: editStock };
      }
      return item;
    });
    onUpdateInventory(updated);
    setEditingInvId(null);
    onSendToast('✅ Precios y existencias del almacén actualizados.');
  };

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName || newPartPrice <= 0) return;

    const newPart: PartInventory = {
      id: `inv-new-${Date.now()}`,
      name: newPartName,
      cost: newPartCost,
      price: newPartPrice,
      stock: newPartStock
    };

    onUpdateInventory([...inventory, newPart]);
    setNewPartName('');
    setNewPartCost(0);
    setNewPartPrice(0);
    setNewPartStock(0);
    onSendToast(`📦 Refacción "${newPartName}" añadida al catálogo.`);
  };

  // User control actions
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName) return;

    const newUser: User = {
      id: `usr-new-${Date.now()}`,
      name: newUserName,
      role: newUserRole,
      active: true
    };

    onUpdateUsers([...users, newUser]);
    setNewUserName('');
    onSendToast(`👤 Usuario "${newUserName}" dado de alta con rol de ${newUserRole}.`);
  };

  const toggleUserActive = (id: string) => {
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, active: !u.active };
      }
      return u;
    });
    onUpdateUsers(updated);
    onSendToast('👤 Permisos y estado de usuario modificados con éxito.');
  };

  // Checkout digital release action
  const handleCheckoutSubmit = () => {
    if (!selectedCheckoutOrder) return;

    const updatedOrder: ServiceOrder = {
      ...selectedCheckoutOrder,
      status: 'Entregado',
      exitDate: new Date().toISOString()
    };

    onUpdateOrder(updatedOrder);
    onSendToast(`💳 Orden ${selectedCheckoutOrder.id} liquidada vía ${paymentMethod}. Auto liberado digitalmente.`);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Sub-tabs header matching visual layout */}
      <div className="hidden lg:flex flex-wrap bg-slate-100 rounded-xl p-1 self-start gap-1">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'dashboard' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📈 Dashboard Global
        </button>
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'inventory' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📦 Catálogo / Almacén
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'users' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          👥 Control de Personal
        </button>
        <button
          onClick={() => setActiveSubTab('checkout')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'checkout' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          💳 Caja y Liquidación
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'audit' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🔍 Auditoría de Evidencias
        </button>
      </div>

      {/* SUBTAB 1: DASHBOARD GLOBAL */}
      {activeSubTab === 'dashboard' && (
        <AdminDashboardView orders={orders} />
      )}

      {/* SUBTAB 2: NUTRIDOR DE PRECIOS / INVENTARIO */}
      {activeSubTab === 'inventory' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Inventory Table */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
              <Package className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Nutridor de Catálogo y Almacén</h3>
                <p className="text-[10px] text-slate-500 font-medium">Control de stock de refacciones y matriz de precios</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px]">
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Refacción / Item</th>
                    <th className="py-3 px-3 text-right">Costo Interno</th>
                    <th className="py-3 px-3 text-right">Precio de Venta</th>
                    <th className="py-3 px-3 text-center">Existencias</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => {
                    const isEditing = editingInvId === item.id;
                    return (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">{item.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{item.name}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">${item.cost.toLocaleString('es-MX')}</td>
                        
                        <td className="py-3 px-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPrice}
                              onChange={e => setEditPrice(parseFloat(e.target.value) || 0)}
                              className="w-20 text-right text-xs border border-slate-300 rounded px-1.5 py-1 font-mono outline-none"
                            />
                          ) : (
                            <span className="font-mono font-extrabold text-slate-800">${item.price.toLocaleString('es-MX')}</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editStock}
                              onChange={e => setEditStock(parseInt(e.target.value, 10) || 0)}
                              className="w-16 text-center text-xs border border-slate-300 rounded px-1.5 py-1 font-mono outline-none"
                            />
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.stock <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {item.stock} pzas
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => handleSaveInventoryEdit(item.id)}
                                className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingInvId(null)}
                                className="p-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingInvId(item.id);
                                setEditPrice(item.price);
                                setEditStock(item.stock);
                              }}
                              className="px-2 py-1 text-[10px] font-bold border border-slate-200 hover:border-slate-300 rounded bg-white flex items-center gap-1 mx-auto cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3 text-rose-500" /> Modificar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Part Addition sidebar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Plus className="w-5 h-5 text-rose-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">NUEVO PRODUCTO / REFACCIÓN</h3>
            </div>

            <form onSubmit={handleCreatePart} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Nombre Comercial de Refacción *</label>
                <input
                  type="text"
                  required
                  value={newPartName}
                  onChange={e => setNewPartName(e.target.value)}
                  placeholder="Ej. Banda de alternador"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Costo de Adquisición Interno ($)</label>
                <input
                  type="number"
                  value={newPartCost === 0 ? '' : newPartCost}
                  onChange={e => setNewPartCost(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Precio Público de Venta ($) *</label>
                <input
                  type="number"
                  required
                  value={newPartPrice === 0 ? '' : newPartPrice}
                  onChange={e => setNewPartPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Stock de Entrada Inicial</label>
                <input
                  type="number"
                  value={newPartStock === 0 ? '' : newPartStock}
                  onChange={e => setNewPartStock(parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Registrar Refacción
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CONTROL DE PERSONAL */}
      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Users List Table */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
              <Users className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Control de Usuarios e Ingreso</h3>
                <p className="text-[10px] text-slate-500 font-medium">Alta, baja y asignación de permisos para Asesores y Técnicos</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px]">
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Nombre de Colaborador</th>
                    <th className="py-3 px-4 text-center">Rol Asignado</th>
                    <th className="py-3 px-4 text-center">Acceso Autorizado</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{u.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{u.name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${
                          u.role === 'Admin' ? 'bg-rose-100 text-rose-800' :
                          u.role === 'Asesor' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {u.role === 'Admin' ? '👑 Admin' : u.role === 'Asesor' ? '👔 Asesor' : '🔧 Mecánico'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleUserActive(u.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors focus:outline-none inline-block mx-auto cursor-pointer"
                        >
                          {u.active ? (
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                              <ToggleRight className="w-6 h-6 text-emerald-500 shrink-0" /> ACTIVO
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px]">
                              <ToggleLeft className="w-6 h-6 text-slate-300 shrink-0" /> SUSPENDIDO
                            </div>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add user form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Plus className="w-5 h-5 text-rose-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">DAR DE ALTA COLABORADOR</h3>
            </div>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Nombre del Colaborador *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="Ej. Ing. Ernesto Torres"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Rol / Permisos del Sistema *</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white outline-none cursor-pointer font-medium"
                >
                  <option value="Asesor">Asesor de Servicio / Recepcionista</option>
                  <option value="Mecánico">Mecánico / Técnico de Diagnóstico</option>
                  <option value="Admin">Administrador / Dueño de Negocio</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Registrar Colaborador
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 4: CAJA Y LIQUIDACIÓN */}
      {activeSubTab === 'checkout' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 mb-5 gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Caja y Liquidación de Órdenes</h3>
                <p className="text-[10px] text-slate-500 font-medium">Validación final de refacciones, cierre de cuenta y cobro</p>
              </div>
            </div>

            {/* Selector de Orden para liquidar */}
            <select
              value={selectedCheckoutOrderId}
              onChange={e => setSelectedCheckoutOrderId(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-500 bg-slate-50 font-bold cursor-pointer"
            >
              <option value="" disabled>Seleccione Orden a Liquidar...</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.id} - {o.clientName} ({o.brand} {o.model}) | Estatus: {o.status}
                </option>
              ))}
            </select>
          </div>

          {selectedCheckoutOrder ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Account details & Items list */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">Conceptos Cargados a la Cuenta</h4>
                
                <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px]">
                        <th className="py-3 px-4">Concepto Autorizado</th>
                        <th className="py-3 px-3 text-center">Tipo</th>
                        <th className="py-3 px-3 text-right">Cant.</th>
                        <th className="py-3 px-3 text-right">Precio</th>
                        <th className="py-3 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCheckoutOrder.budget.items.map(item => (
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
                          <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-800">${(item.price * item.quantity).toLocaleString('es-MX')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals Box */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 sm:self-end w-full sm:w-72 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Subtotal Neto</span>
                    <span className="font-mono">${(selectedCheckoutOrder.budget.totalPrice * 0.84).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>I.V.A (16%)</span>
                    <span className="font-mono">${(selectedCheckoutOrder.budget.totalPrice * 0.16).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-800 border-t border-slate-200 pt-2 mt-1">
                    <span>TOTAL A PAGAR</span>
                    <span className="font-mono text-rose-600 text-base">${selectedCheckoutOrder.budget.totalPrice.toLocaleString('es-MX')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Box & Digital Release */}
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/40 flex flex-col justify-between gap-6">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-rose-500" /> Registro de Pago y Cierre
                  </h4>

                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-1">Estatus Actual</span>
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase inline-block ${
                        selectedCheckoutOrder.status === 'Listo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {selectedCheckoutOrder.status === 'Listo' ? '👍 Trabajo Terminado' : '🔧 Trabajo En Proceso'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Método de Pago Seleccionado</label>
                      <div className="flex flex-col gap-2">
                        {(['Efectivo', 'Tarjeta', 'Transferencia'] as const).map(method => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2 px-3 text-xs font-bold rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                              paymentMethod === method 
                                ? 'bg-slate-800 border-slate-800 text-white shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{method}</span>
                            {paymentMethod === method && <Check className="w-4 h-4 text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCheckoutSubmit}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" /> Registrar Pago y Liberar Auto
                  </button>
                  <p className="text-[10px] text-slate-400 font-medium text-center leading-normal">
                    Al confirmar el pago se genera el ticket fiscal original de liberación y se envía copia digital al cliente por WhatsApp.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center p-12 text-slate-400 text-xs">
              Seleccione una orden de servicio arriba para comenzar la liquidación de caja.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 5: AUDITORÍA DE EVIDENCIAS */}
      {activeSubTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Historial de Auditoría Visual (Cámara)</h3>
                <p className="text-[10px] text-slate-500 font-medium">Acceso permanente a evidencias de cualquier orden actual o pasada para resolver disputas</p>
              </div>
            </div>

            {/* Select Order for Audit */}
            <select
              value={selectedAuditOrderId}
              onChange={e => setSelectedAuditOrderId(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-500 bg-slate-50 font-bold cursor-pointer"
            >
              <option value="" disabled>Seleccione Orden a Auditar...</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.id} - {o.clientName} ({o.brand})
                </option>
              ))}
            </select>
          </div>

          {selectedAuditOrder ? (
            <div className="flex flex-col gap-6">
              
              {/* Order quick metadata info */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    {selectedAuditOrder.id} - {selectedAuditOrder.clientName} 
                    <span className="font-mono text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded uppercase">{selectedAuditOrder.plate}</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Vehículo: {selectedAuditOrder.brand} {selectedAuditOrder.model} {selectedAuditOrder.year} | Estatus: <span className="font-bold text-rose-600">{selectedAuditOrder.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Ingreso</span>
                  <span className="text-xs font-bold text-slate-700">{new Date(selectedAuditOrder.entryDate).toLocaleDateString('es-MX')} | {new Date(selectedAuditOrder.entryDate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs</span>
                </div>
              </div>

              {/* Grid grouped by category (RECEPCION, DIAGNOSTICO, REPARACION) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. RECEPCION EVIDENCES */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 font-bold text-xs text-slate-500 uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 bg-slate-500 rounded-full inline-block" />
                    RECEPCIÓN (ASESOR)
                  </div>
                  <div className="flex flex-col gap-3">
                    {selectedAuditOrder.evidences.filter(ev => ev.type === 'RECEPCION').map(ev => (
                      <div key={ev.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-40 bg-slate-100">
                          <img src={ev.url} alt={ev.description} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-slate-700 font-bold leading-relaxed">"{ev.description}"</p>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-2">
                            <span>{ev.takenBy}</span>
                            <span className="font-mono">{new Date(ev.createdAt).toLocaleDateString('es-MX')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedAuditOrder.evidences.filter(ev => ev.type === 'RECEPCION').length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                        Ninguna foto de recepción en esta orden.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. DIAGNOSTICO EVIDENCES */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 font-bold text-xs text-slate-500 uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block animate-pulse" />
                    DIAGNÓSTICO (MECÁNICO)
                  </div>
                  <div className="flex flex-col gap-3">
                    {selectedAuditOrder.evidences.filter(ev => ev.type === 'DIAGNOSTICO').map(ev => (
                      <div key={ev.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-40 bg-slate-100">
                          <img src={ev.url} alt={ev.description} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-slate-700 font-bold leading-relaxed">"{ev.description}"</p>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-2">
                            <span>{ev.takenBy}</span>
                            <span className="font-mono">{new Date(ev.createdAt).toLocaleDateString('es-MX')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedAuditOrder.evidences.filter(ev => ev.type === 'DIAGNOSTICO').length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                        Ninguna foto de diagnóstico cargada por el técnico aún.
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. REPARACION EVIDENCES */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 font-bold text-xs text-slate-500 uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
                    REPARACIÓN (TRABAJO LISTO)
                  </div>
                  <div className="flex flex-col gap-3">
                    {selectedAuditOrder.evidences.filter(ev => ev.type === 'REPARACION').map(ev => (
                      <div key={ev.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-40 bg-slate-100">
                          <img src={ev.url} alt={ev.description} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-slate-700 font-bold leading-relaxed">"{ev.description}"</p>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-2">
                            <span>{ev.takenBy}</span>
                            <span className="font-mono">{new Date(ev.createdAt).toLocaleDateString('es-MX')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedAuditOrder.evidences.filter(ev => ev.type === 'REPARACION').length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                        Ninguna foto de refacción instalada cargada aún.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="text-center p-12 text-slate-400 text-xs">
              Seleccione una orden de servicio arriba para realizar la auditoría visual de evidencias.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
