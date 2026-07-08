export type OrderStatus = 'Ingresado' | 'En Diagnóstico' | 'Esperando Autorización' | 'En Reparación' | 'Listo' | 'Entregado';

export interface Evidence {
  id: string;
  type: 'RECEPCION' | 'DIAGNOSTICO' | 'REPARACION';
  url: string;
  description: string;
  createdAt: string;
  takenBy: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  type: 'Mano de Obra' | 'Refacción';
  approved: 'pending' | 'approved' | 'rejected';
}

export interface Budget {
  items: BudgetItem[];
  totalPrice: number;
  status: 'Sin Cotizar' | 'Pendiente de Autorización' | 'Aprobado Parcial' | 'Aprobado Total' | 'Rechazado';
}

export interface ServiceOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  plate: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  status: OrderStatus;
  entryDate: string;
  exitDate?: string;
  
  // Checklist de recepción
  gasLevel: number; // 0, 25, 50, 75, 100
  hasSpareTire: boolean;
  hasJack: boolean;
  hasTools: boolean;
  hasExtinguisher: boolean;
  generalObservations: string;
  
  // Firma del cliente
  clientSignature?: string; // Base64 de firma en canvas
  
  // Evidencias fotográficas
  evidences: Evidence[];
  
  // Cotización
  budget: Budget;
}

export interface PartInventory {
  id: string;
  name: string;
  cost: number;
  price: number;
  stock: number;
}

export interface User {
  id: string;
  name: string;
  role: 'Asesor' | 'Mecánico' | 'Admin';
  active: boolean;
}
