import { useState } from 'react';
import { Calendar, Bell, Shield, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface VerificationInfo {
  lastDigit: number;
  color: 'Amarillo' | 'Rosa' | 'Rojo' | 'Verde' | 'Azul';
  colorHex: string;
  bgHex: string;
  textHex: string;
  period1: string;
  period2: string;
  message: string;
}

export function getCDMXVerification(plate: string): VerificationInfo {
  // Extract all numbers from plate
  const digits = plate.replace(/\D/g, '');
  // Get last digit, fallback to 5 if none
  const lastDigitStr = digits.length > 0 ? digits[digits.length - 1] : '';
  const lastDigit = lastDigitStr !== '' ? parseInt(lastDigitStr, 10) : 5;

  if (lastDigit === 5 || lastDigit === 6) {
    return {
      lastDigit,
      color: 'Amarillo',
      colorHex: '#eab308', // Amber 500
      bgHex: '#fef9c3', // Yellow 100
      textHex: '#854d0e', // Yellow 800
      period1: 'Enero - Febrero',
      period2: 'Julio - Agosto',
      message: 'Le corresponde verificar en el primer bimestre de cada semestre (Ene/Feb y Jul/Ago).'
    };
  } else if (lastDigit === 7 || lastDigit === 8) {
    return {
      lastDigit,
      color: 'Rosa',
      colorHex: '#ec4899', // Pink 500
      bgHex: '#fce7f3', // Pink 100
      textHex: '#9d174d', // Pink 800
      period1: 'Febrero - Marzo',
      period2: 'Agosto - Septiembre',
      message: 'Le corresponde verificar en el segundo bimestre de cada semestre (Feb/Mar y Ago/Sep).'
    };
  } else if (lastDigit === 3 || lastDigit === 4) {
    return {
      lastDigit,
      color: 'Rojo',
      colorHex: '#ef4444', // Red 500
      bgHex: '#fee2e2', // Red 100
      textHex: '#991b1b', // Red 800
      period1: 'Marzo - Abril',
      period2: 'Septiembre - Octubre',
      message: 'Le corresponde verificar en el tercer bimestre de cada semestre (Mar/Abr y Sep/Oct).'
    };
  } else if (lastDigit === 1 || lastDigit === 2) {
    return {
      lastDigit,
      color: 'Verde',
      colorHex: '#22c55e', // Green 500
      bgHex: '#dcfce7', // Green 100
      textHex: '#166534', // Green 800
      period1: 'Abril - Mayo',
      period2: 'Octubre - Noviembre',
      message: 'Le corresponde verificar en el cuarto bimestre de cada semestre (Abr/May y Oct/Nov).'
    };
  } else {
    // 9 or 0
    return {
      lastDigit,
      color: 'Azul',
      colorHex: '#3b82f6', // Blue 500
      bgHex: '#dbeafe', // Blue 100
      textHex: '#1e40af', // Blue 800
      period1: 'Mayo - Junio',
      period2: 'Noviembre - Diciembre',
      message: 'Le corresponde verificar en el quinto bimestre de cada semestre (May/Jun y Nov/Dic).'
    };
  }
}

interface VerificationCDMXProps {
  plate: string;
  onSendAlert?: (msg: string) => void;
}

export default function VerificationCDMX({ plate, onSendAlert }: VerificationCDMXProps) {
  const [testPlate, setTestPlate] = useState(plate);
  const info = getCDMXVerification(testPlate || '5');

  const handleAlertClick = (period: string, colorName: string) => {
    if (onSendAlert) {
      onSendAlert(`🔔 Alerta de Verificación CDMX configurada para Engomado ${colorName} (Periodo: ${period}). Le notificaremos en su celular.`);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-rose-500" />
        <h3 className="text-sm font-bold text-slate-800">Calendario de Verificación CDMX</h3>
      </div>

      <div className="mb-4">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Consultar por Placa de Auto
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={testPlate}
            onChange={(e) => setTestPlate(e.target.value.toUpperCase())}
            placeholder="Ej. ABC-1234"
            className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 uppercase font-mono tracking-wider focus:outline-none focus:border-rose-500 bg-white"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Engomado CDMX</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span 
                className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-inner" 
                style={{ backgroundColor: info.colorHex }}
              />
              <span className="text-xs font-bold text-slate-800">Color {info.color}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400">Último Dígito</span>
            <div className="text-xs font-bold font-mono text-slate-800 mt-0.5">Dígito {info.lastDigit}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Primer Semestre</span>
            <span className="text-xs font-bold text-slate-700 block">{info.period1}</span>
            <button
              onClick={() => handleAlertClick(info.period1, info.color)}
              className="mt-2 text-[10px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Bell className="w-3 h-3" /> Activar Recordatorio
            </button>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Segundo Semestre</span>
            <span className="text-xs font-bold text-slate-700 block">{info.period2}</span>
            <button
              onClick={() => handleAlertClick(info.period2, info.color)}
              className="mt-2 text-[10px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Bell className="w-3 h-3" /> Activar Recordatorio
            </button>
          </div>
        </div>

        <div className="flex gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
          <Info className="w-4 h-4 shrink-0 text-sky-500" />
          <span>{info.message}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-800">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <div>
            <span className="font-bold">Multa por verificación extemporánea:</span> Actualmente en la CDMX la multa equivale a 20 UMA (~$2,170 MXN). ¡Evita recargos agendando tu servicio a tiempo!
          </div>
        </div>
      </div>
    </div>
  );
}
