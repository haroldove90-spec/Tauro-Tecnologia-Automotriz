import { ServiceOrder } from '../types';
import { Sparkles, TrendingUp, Users, DollarSign, Award, ArrowUpRight } from 'lucide-react';

interface AdminDashboardViewProps {
  orders: ServiceOrder[];
}

export default function AdminDashboardView({ orders }: AdminDashboardViewProps) {
  // Compute real metrics from orders
  const totalSales = orders
    .filter(o => o.status === 'Listo' || o.status === 'Entregado' || o.budget.status === 'Aprobado Total')
    .reduce((sum, o) => sum + o.budget.totalPrice, 0);

  const pendingSales = orders
    .filter(o => o.status === 'Esperando Autorización' || o.budget.status === 'Pendiente de Autorización')
    .reduce((sum, o) => sum + o.budget.totalPrice, 0);

  const averageTicket = orders.length > 0
    ? Math.round(orders.reduce((sum, o) => sum + o.budget.totalPrice, 0) / orders.length)
    : 0;

  const ordersCountByStatus = {
    Ingresado: orders.filter(o => o.status === 'Ingresado').length,
    Diagnostic: orders.filter(o => o.status === 'En Diagnóstico').length,
    AuthPending: orders.filter(o => o.status === 'Esperando Autorización').length,
    Repair: orders.filter(o => o.status === 'En Reparación').length,
    Done: orders.filter(o => o.status === 'Listo' || o.status === 'Entregado').length,
  };

  const totalOrders = orders.length;
  const completedPct = totalOrders > 0 ? Math.round((ordersCountByStatus.Done / totalOrders) * 100) : 0;
  const inRepairPct = totalOrders > 0 ? Math.round((ordersCountByStatus.Repair / totalOrders) * 100) : 0;
  const pendingPct = totalOrders > 0 ? Math.round(((totalOrders - ordersCountByStatus.Done) / totalOrders) * 100) : 0;

  // Render pixel-perfect charts inspired by the reference mockup image!
  // Colors used in mockup:
  // - Dark Blue: #111827 or #0f172a
  // - Dark Teal: #0f766e (consectetuer labels and segments)
  // - Red: #ef4444 (accent colors, warnings, status blocks)
  // - Soft Grey: #e2e8f0 or #f1f5f9

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ingresos del Día</span>
            <span className="text-xl font-extrabold text-slate-800 font-mono mt-1 block">
              ${totalSales.toLocaleString('es-MX')}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> +12% vs ayer
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Promedio</span>
            <span className="text-xl font-extrabold text-slate-800 font-mono mt-1 block">
              ${averageTicket.toLocaleString('es-MX')}
            </span>
            <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5 mt-1">
              <Sparkles className="w-3 h-3" /> Basado en {totalOrders} órdenes
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cotizaciones Pendientes</span>
            <span className="text-xl font-extrabold text-slate-800 font-mono mt-1 block">
              ${pendingSales.toLocaleString('es-MX')}
            </span>
            <span className="text-[10px] text-amber-600 font-bold block mt-1">
              Esperando firma de cliente
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eficiencia Operativa</span>
            <span className="text-xl font-extrabold text-slate-800 font-mono mt-1 block">
              {completedPct}%
            </span>
            <span className="text-[10px] text-sky-600 font-bold block mt-1">
              {ordersCountByStatus.Done} autos entregados hoy
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 1: Charts Inspired directly by the mockup uploaded */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mockup Section 1: Two Side-by-side Donuts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              DISTRIBUCIÓN DE ÓRDENES Y TRABAJO
            </h3>
            <span className="text-[10px] font-bold text-slate-400">EN TIEMPO REAL</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
            {/* Donut Left: Total orders completed vs pending */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="58" stroke="#f1f5f9" strokeWidth="16" fill="transparent" />
                  {/* Teal segment for completed */}
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="58" 
                    stroke="#10b981" 
                    strokeWidth="16" 
                    fill="transparent" 
                    strokeDasharray="364.4" 
                    strokeDashoffset={364.4 - (364.4 * completedPct) / 100}
                    strokeLinecap="round" 
                  />
                  {/* Red segment for repair */}
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="58" 
                    stroke="#ef4444" 
                    strokeWidth="16" 
                    fill="transparent" 
                    strokeDasharray="364.4" 
                    strokeDashoffset={364.4 - (364.4 * inRepairPct) / 100}
                    transform={`rotate(${(completedPct / 100) * 360} 72 72)`}
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">TOTAL</span>
                  <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">{totalOrders}</span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-4 uppercase">Estado del Taller</h4>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                Órdenes listas <span className="text-emerald-600 font-bold">({completedPct}%)</span> y en proceso de reparación <span className="text-rose-600 font-bold">({inRepairPct}%)</span>.
              </p>
            </div>

            {/* Donut Right: Quote Approvals */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="58" stroke="#f1f5f9" strokeWidth="16" fill="transparent" />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="58" 
                    stroke="#10b981" 
                    strokeWidth="16" 
                    fill="transparent" 
                    strokeDasharray="364.4" 
                    strokeDashoffset={364.4 - (364.4 * 75) / 100} // Mock 75% approval rate
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">APROBADA</span>
                  <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">75%</span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-4 uppercase">Aprobación Digital</h4>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                Tasa de aceptación de presupuestos enviados vía WhatsApp por los clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Mockup Section 2: Horizontal Bars List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                PRODUCTIVIDAD DEL TÉCNICO
              </h3>
              <span className="text-[10px] font-bold text-emerald-600">EN SERVICIO</span>
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>MEC. ROBERTO GÓMEZ</span>
                  <span className="font-mono text-rose-600">12,434 pts (5)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>MEC. SOFÍA CÁRDENAS</span>
                  <span className="font-mono text-emerald-600">11,654 pts (4)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>ASESOR ALEJANDRO S.</span>
                  <span className="font-mono text-rose-500">10,435 pts (8)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>SIN ASIGNAR / EXPRÉS</span>
                  <span className="font-mono text-slate-400">05,435 pts</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 text-center">
            <span className="text-[10px] text-slate-400 font-medium">Productividad ponderada por horas y grado de dificultad.</span>
          </div>
        </div>
      </div>

      {/* Row 2: Gauge & Metric boxes mimicking second row of uploaded image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Speedometer/Gauge Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              CAPACIDAD EN TALLER
            </h3>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded-full">MEDIO</span>
          </div>

          {/* SVG Gauge Speedometer */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-40 h-24 flex items-end justify-center overflow-hidden">
              <svg className="w-40 h-40 absolute bottom-0">
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="60%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                {/* Background arc */}
                <path 
                  d="M 20 80 A 60 60 0 0 1 140 80" 
                  fill="none" 
                  stroke="#f1f5f9" 
                  strokeWidth="14" 
                  strokeLinecap="round" 
                />
                {/* Active progress arc (e.g. 60% capacity occupied) */}
                <path 
                  d="M 20 80 A 60 60 0 0 1 140 80" 
                  fill="none" 
                  stroke="url(#gaugeGrad)" 
                  strokeWidth="14" 
                  strokeDasharray="188.4" 
                  strokeDashoffset={188.4 - (188.4 * 60) / 100}
                  strokeLinecap="round" 
                />
              </svg>
              
              {/* Speedometer indicator needle rotated according to value */}
              <div 
                className="w-1 h-14 bg-slate-800 origin-bottom rounded-full absolute bottom-0 transition-transform duration-1000 ease-out"
                style={{ transform: 'rotate(18deg)', marginBottom: '-2px' }} // 60% is roughly 18deg if -90deg is 0% and +90deg is 100%
              />
              <div className="w-4 h-4 rounded-full bg-slate-800 absolute bottom-0 -mb-2 shadow border-2 border-white" />
            </div>

            <div className="flex justify-between w-full px-4 text-[9px] font-bold text-slate-400 mt-2">
              <span>0% (Vacío)</span>
              <span>50%</span>
              <span>100% (Lleno)</span>
            </div>

            <span className="text-xl font-black text-slate-800 mt-3 font-mono">60%</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Bahías de Trabajo Ocupadas</span>
          </div>

          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            6 de las 10 rampas del taller mecánico están ocupadas con autos en diagnóstico o reparación activa.
          </p>
        </div>

        {/* Middle: Consectetuer Double Totals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
              ESTADÍSTICAS OPERATIVAS
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Control de calidad e inventarios</span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3">
            <div className="border-r border-slate-100 pr-3">
              <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none">TOTAL ÓRDENES</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight font-mono block mt-1">20,256</span>
              <p className="text-[9px] text-slate-400 leading-tight mt-1">Órdenes acumuladas en el histórico digital del taller.</p>
            </div>
            <div className="pl-3">
              <span className="text-[9px] font-bold text-rose-500 block uppercase leading-none">PIEZAS USADAS</span>
              <span className="text-2xl font-black text-rose-600 tracking-tight font-mono block mt-1">10,435</span>
              <p className="text-[9px] text-slate-400 leading-tight mt-1">Refacciones surtidas para reparaciones mayores este año.</p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between mt-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Tiempo de Entrega Promedio</span>
            <span className="text-xs font-black text-slate-700 font-mono">24.5 Hrs</span>
          </div>
        </div>

        {/* Right: Sound icon card with vertical bars */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
              <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Métricas de Satisfacción</h3>
                <span className="text-[10px] text-rose-500 font-semibold uppercase">Calificación Promedio</span>
              </div>
            </div>

            <div className="flex justify-between items-end h-24 py-2 px-4">
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-4 h-16 bg-slate-800 rounded" />
                <span className="text-[9px] font-bold text-slate-400">Excelente</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-4 h-6 bg-rose-500 rounded" />
                <span className="text-[9px] font-bold text-slate-400">Regular</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-4 h-12 bg-teal-600 rounded" />
                <span className="text-[9px] font-bold text-slate-400">Bueno</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 text-center">
            <span className="text-xl font-black text-slate-800 font-mono">4.8 / 5.0</span>
            <span className="text-[10px] text-slate-400 font-bold block">Encuesta de salida digital por WhatsApp</span>
          </div>
        </div>

      </div>
    </div>
  );
}
