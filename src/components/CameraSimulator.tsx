import { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { MOCK_PHOTOS } from '../data/mockData';

interface CameraSimulatorProps {
  onCapture: (url: string) => void;
  evidenceType: 'RECEPCION' | 'DIAGNOSTICO' | 'REPARACION';
}

export default function CameraSimulator({ onCapture, evidenceType }: CameraSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'mock'>('mock');
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Suggested mock options based on active evidence type
  const getMockOptions = () => {
    switch (evidenceType) {
      case 'RECEPCION':
        return [
          { label: 'Frente del Auto', url: MOCK_PHOTOS.recepcion_frente, desc: 'Vista frontal inicial sin abolladuras' },
          { label: 'Costado Derecho', url: MOCK_PHOTOS.recepcion_derecha, desc: 'Abolladura leve en puerta trasera' },
          { label: 'Costado Izquierdo', url: MOCK_PHOTOS.recepcion_izquierda, desc: 'Rayón longitudinal en pintura' },
          { label: 'Parte Trasera', url: MOCK_PHOTOS.recepcion_atras, desc: 'Defensa trasera con raspones leves' }
        ];
      case 'DIAGNOSTICO':
        return [
          { label: 'Fuga de Aceite', url: MOCK_PHOTOS.diagnostico_fuga, desc: 'Fuga visible en junta de punterías' },
          { label: 'Balatas Desgastadas', url: MOCK_PHOTOS.diagnostico_balatas, desc: 'Grosor de balatas por debajo de 2mm' },
          { label: 'Falla Amortiguador', url: MOCK_PHOTOS.diagnostico_amortiguador, desc: 'Amortiguador con derrame de fluido hidráulico' }
        ];
      case 'REPARACION':
        return [
          { label: 'Pieza Nueva Instalada', url: MOCK_PHOTOS.reparacion_nueva, desc: 'Refacción colocada y ajustada con torquímetro' },
          { label: 'Auto Lavado / Terminado', url: MOCK_PHOTOS.reparacion_limpio, desc: 'Lavado de carrocería y motor finalizado' }
        ];
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err: any) {
      console.warn('Camera blocked or not available:', err);
      setCameraError('No se pudo acceder a la cámara (puede estar bloqueada o no soportada en el iFrame del navegador). Usa la pestaña "Simulación de Galería".');
      setActiveTab('mock');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64 = canvas.toDataURL('image/jpeg');
    onCapture(base64);
    
    // Play subtle flash animation effect
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white opacity-90 transition-opacity duration-200 pointer-events-none';
    video.parentElement?.appendChild(flash);
    setTimeout(() => {
      flash.classList.add('opacity-0');
      setTimeout(() => flash.remove(), 200);
    }, 50);
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
      <div className="flex border-b border-slate-100 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('mock')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'mock' 
              ? 'bg-white text-rose-600 shadow-sm' 
              : 'text-zinc-600 hover:text-[#282829]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Simular Foto de Taller
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'camera' 
              ? 'bg-white text-rose-600 shadow-sm' 
              : 'text-zinc-600 hover:text-[#282829]'
          }`}
        >
          <Camera className="w-4 h-4" />
          Cámara en Vivo
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'camera' && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-300">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {!streamActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mb-2 text-slate-500" />
                  <span className="text-xs">Iniciando transmisión de cámara...</span>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="flex gap-2 p-2 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{cameraError}</span>
              </div>
            )}

            <button
              type="button"
              disabled={!streamActive}
              onClick={capturePhoto}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              Tomar Foto
            </button>
          </div>
        )}

        {activeTab === 'mock' && (
          <div className="flex flex-col gap-3">
            <div className="text-[11px] text-slate-500 font-medium bg-slate-50 p-2 rounded border border-slate-200">
              💡 Simula el uso de la cámara seleccionando una foto de diagnóstico o recepción real. Haz clic sobre una imagen para adjuntarla instantáneamente a esta orden.
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {getMockOptions().map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onCapture(opt.url)}
                  className="group flex flex-col border border-slate-200 rounded-lg overflow-hidden hover:border-rose-500 text-left bg-slate-50/50 hover:bg-white transition-all cursor-pointer shadow-sm"
                >
                  <div className="relative h-24 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={opt.url} 
                      alt={opt.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-rose-600">{opt.label}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
