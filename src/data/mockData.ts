import { ServiceOrder, PartInventory, User } from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'usr-1', name: 'Asesor Alejandro Solís', role: 'Asesor', active: true },
  { id: 'usr-2', name: 'Mecánico Roberto Gómez', role: 'Mecánico', active: true },
  { id: 'usr-3', name: 'Mecánica Sofía Cárdenas', role: 'Mecánico', active: true },
  { id: 'usr-4', name: 'Ing. Carlos Ortiz (Admin)', role: 'Admin', active: true },
];

export const INITIAL_INVENTORY: PartInventory[] = [
  { id: 'inv-1', name: 'Balatas Delanteras (Par)', cost: 450, price: 890, stock: 15 },
  { id: 'inv-2', name: 'Aceite Sintético 5W30 (Litro)', cost: 120, price: 240, stock: 48 },
  { id: 'inv-3', name: 'Filtro de Aceite', cost: 80, price: 180, stock: 30 },
  { id: 'inv-4', name: 'Filtro de Aire', cost: 95, price: 190, stock: 25 },
  { id: 'inv-5', name: 'Bujía de Iridio (Pieza)', cost: 110, price: 220, stock: 40 },
  { id: 'inv-6', name: 'Disco de Freno Delantero', cost: 600, price: 1250, stock: 8 },
  { id: 'inv-7', name: 'Batería 12V 650A', cost: 1200, price: 2450, stock: 6 },
  { id: 'inv-8', name: 'Amortiguador Delantero', cost: 850, price: 1750, stock: 12 },
  { id: 'inv-9', name: 'Líquido de Frenos DOT4', cost: 70, price: 150, stock: 20 },
];

export const SERVICES_EXPRES = [
  { id: 'se-1', name: 'Afinación Mayor (4 Cilindros)', price: 1850, description: 'Cambio de bujías, aceite sintético, filtros de aire, gasolina y aceite, lavado de inyectores y cuerpo de aceleración.' },
  { id: 'se-2', name: 'Cambio de Aceite y Filtro', price: 950, description: 'Incluye hasta 4 litros de aceite sintético 5W30 y filtro de aceite comercial.' },
  { id: 'se-3', name: 'Servicio de Frenos Delanteros', price: 1350, description: 'Cambio de balatas y rectificado de discos delanteros.' },
  { id: 'se-4', name: 'Diagnóstico por Computadora (Scanner)', price: 450, description: 'Escaneo completo de códigos de falla, lectura de sensores en vivo y borrado de códigos.' },
  { id: 'se-5', name: 'Servicio de Alineación y Balanceo', price: 650, description: 'Alineación computarizada delantera y balanceo de las 4 ruedas.' },
];

// Pre-packaged vehicle photos for easy and beautiful mock selection
export const MOCK_PHOTOS = {
  recepcion_frente: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600',
  recepcion_atras: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
  recepcion_derecha: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=600',
  recepcion_izquierda: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600',
  
  diagnostico_balatas: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600', // motor/pieza rota
  diagnostico_amortiguador: 'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=600', // taller mecánico desarmando
  diagnostico_fuga: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=600', // motor sucio
  
  reparacion_nueva: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=600', // refacción instalada
  reparacion_limpio: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600', // auto terminado reluciente
};

export const INITIAL_ORDERS: ServiceOrder[] = [
  {
    id: 'OS-1001',
    clientName: 'María Fernanda Ruiz',
    clientPhone: '55 1234 5678',
    plate: '824-CDX', // CDMX plate - 4 is rojo
    vin: '1HGCR2F8XHA012345',
    brand: 'Honda',
    model: 'Civic',
    year: 2017,
    status: 'Ingresado',
    entryDate: '2026-07-08T09:15:00-07:00',
    gasLevel: 50,
    hasSpareTire: true,
    hasJack: true,
    hasTools: true,
    hasExtinguisher: false,
    generalObservations: 'Detalles menores en pintura. Cliente reporta rechinido al frenar.',
    clientSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADICA...', // Placeholder
    evidences: [
      {
        id: 'ev-1',
        type: 'RECEPCION',
        url: MOCK_PHOTOS.recepcion_frente,
        description: 'Frente del vehículo - sin rayones visibles.',
        createdAt: '2026-07-08T09:18:00-07:00',
        takenBy: 'Asesor Alejandro Solís'
      },
      {
        id: 'ev-2',
        type: 'RECEPCION',
        url: MOCK_PHOTOS.recepcion_derecha,
        description: 'Costado derecho - abolladura leve en puerta trasera.',
        createdAt: '2026-07-08T09:19:00-07:00',
        takenBy: 'Asesor Alejandro Solís'
      }
    ],
    budget: {
      items: [
        { id: 'bi-1', description: 'Servicio de Frenos Delanteros', quantity: 1, price: 1350, type: 'Mano de Obra', approved: 'pending' },
        { id: 'bi-2', description: 'Balatas Delanteras Premium (Par)', quantity: 1, price: 890, type: 'Refacción', approved: 'pending' }
      ],
      totalPrice: 2240,
      status: 'Pendiente de Autorización'
    }
  },
  {
    id: 'OS-1002',
    clientName: 'Juan Carlos Mendoza',
    clientPhone: '55 9876 5432',
    plate: '503-AMV', // Plate ending 3 - Rojo
    vin: '3N1AB7AP6KL456789',
    brand: 'Nissan',
    model: 'Versa',
    year: 2020,
    status: 'En Diagnóstico',
    entryDate: '2026-07-08T10:30:00-07:00',
    gasLevel: 25,
    hasSpareTire: true,
    hasJack: true,
    hasTools: false,
    hasExtinguisher: true,
    generalObservations: 'Check engine encendido, pérdida de potencia.',
    clientSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASw...',
    evidences: [
      {
        id: 'ev-3',
        type: 'RECEPCION',
        url: MOCK_PHOTOS.recepcion_izquierda,
        description: 'Costado izquierdo - rayón longitudinal en salpicadera.',
        createdAt: '2026-07-08T10:33:00-07:00',
        takenBy: 'Asesor Alejandro Solís'
      },
      {
        id: 'ev-4',
        type: 'DIAGNOSTICO',
        url: MOCK_PHOTOS.diagnostico_fuga,
        description: 'Fuga de aceite detectada en tapa de punterías.',
        createdAt: '2026-07-08T11:15:00-07:00',
        takenBy: 'Mecánico Roberto Gómez'
      }
    ],
    budget: {
      items: [
        { id: 'bi-3', description: 'Afinación Mayor (4 Cilindros)', quantity: 1, price: 1850, type: 'Mano de Obra', approved: 'approved' },
        { id: 'bi-4', description: 'Filtro de Aceite y Aire', quantity: 1, price: 370, type: 'Refacción', approved: 'approved' },
        { id: 'bi-5', description: 'Empaque de tapa de punterías (Adicional descubierto)', quantity: 1, price: 420, type: 'Refacción', approved: 'pending' }
      ],
      totalPrice: 2640,
      status: 'Pendiente de Autorización'
    }
  },
  {
    id: 'OS-1003',
    clientName: 'Eduardo Garza',
    clientPhone: '55 5544 3322',
    plate: '912-VGF', // Plate ending 2 - Verde
    vin: '1FM5K8HC8HGA98765',
    brand: 'Ford',
    model: 'Explorer',
    year: 2018,
    status: 'En Reparación',
    entryDate: '2026-07-07T14:20:00-07:00',
    gasLevel: 75,
    hasSpareTire: true,
    hasJack: true,
    hasTools: true,
    hasExtinguisher: true,
    generalObservations: 'Mantenimiento de los 80,000 km. Cambio de amortiguadores.',
    clientSignature: 'data:image/png;base64,iVBORw0KG...',
    evidences: [
      {
        id: 'ev-5',
        type: 'RECEPCION',
        url: MOCK_PHOTOS.recepcion_atras,
        description: 'Parte trasera - Excelente estado.',
        createdAt: '2026-07-07T14:25:00-07:00',
        takenBy: 'Asesor Alejandro Solís'
      },
      {
        id: 'ev-6',
        type: 'DIAGNOSTICO',
        url: MOCK_PHOTOS.diagnostico_amortiguador,
        description: 'Amortiguador delantero izquierdo con fuga de fluido.',
        createdAt: '2026-07-07T15:45:00-07:00',
        takenBy: 'Mecánica Sofía Cárdenas'
      },
      {
        id: 'ev-7',
        type: 'REPARACION',
        url: MOCK_PHOTOS.reparacion_nueva,
        description: 'Nuevo amortiguador instalado con éxito.',
        createdAt: '2026-07-08T12:00:00-07:00',
        takenBy: 'Mecánica Sofía Cárdenas'
      }
    ],
    budget: {
      items: [
        { id: 'bi-6', description: 'Mano de obra cambio amortiguadores', quantity: 1, price: 1200, type: 'Mano de Obra', approved: 'approved' },
        { id: 'bi-7', description: 'Amortiguadores Delanteros (Par)', quantity: 1, price: 3500, type: 'Refacción', approved: 'approved' }
      ],
      totalPrice: 4700,
      status: 'Aprobado Total'
    }
  },
  {
    id: 'OS-1004',
    clientName: 'Diana Laura Castillo',
    clientPhone: '55 6677 8899',
    plate: '379-UZE', // Plate ending 9 - Azul
    vin: 'WBA3A5C51K8F65432',
    brand: 'BMW',
    model: 'Serie 3',
    year: 2019,
    status: 'Listo',
    entryDate: '2026-07-08T08:00:00-07:00',
    gasLevel: 100,
    hasSpareTire: false,
    hasJack: false,
    hasTools: false,
    hasExtinguisher: false,
    generalObservations: 'Servicio preventivo básico. Detallado estético.',
    clientSignature: 'data:image/png;base64,iVBORw0KG...',
    evidences: [
      {
        id: 'ev-8',
        type: 'RECEPCION',
        url: MOCK_PHOTOS.recepcion_frente,
        description: 'Frente - impecable.',
        createdAt: '2026-07-08T08:05:00-07:00',
        takenBy: 'Asesor Alejandro Solís'
      },
      {
        id: 'ev-9',
        type: 'REPARACION',
        url: MOCK_PHOTOS.reparacion_limpio,
        description: 'Auto terminado y lavado.',
        createdAt: '2026-07-08T14:30:00-07:00',
        takenBy: 'Mecánica Sofía Cárdenas'
      }
    ],
    budget: {
      items: [
        { id: 'bi-8', description: 'Cambio de Aceite y Filtro', quantity: 1, price: 950, type: 'Mano de Obra', approved: 'approved' },
        { id: 'bi-9', description: 'Aceite Sintético 5W30', quantity: 4, price: 240, type: 'Refacción', approved: 'approved' },
        { id: 'bi-10', description: 'Filtro de Aceite Premium', quantity: 1, price: 180, type: 'Refacción', approved: 'approved' }
      ],
      totalPrice: 2090,
      status: 'Aprobado Total'
    }
  }
];
