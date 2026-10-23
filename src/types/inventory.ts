export type EquipmentStatus = 'assigned' | 'available' | 'maintenance' | 'retired';

export interface InventoryItem {
  id: string;
  placa: string;            // Placa / Asset Tag (Identificador de inventario físico)
  nombreEquipo: string;     // Nombre de Equipo / Hostname (ej. TI-LAP-042)
  usuario: string;          // Usuario asignado (ej. Carlos Mendoza o "Sin asignar")
  fabricante: string;       // Fabricante (Dell, HP, Lenovo, Apple, Cisco)
  modelo: string;           // Modelo (ej. Latitude 5430, ThinkPad T14)
  noSerie: string;          // No. Serie / S/N
  direccionIp: string;      // Dirección IP (ej. 192.168.1.145 o DHCP)
  versionSo: string;        // Versión S.O. (ej. Windows 11 Pro 23H2, macOS Sonoma)
  ram: string;              // RAM (ej. 16 GB DDR4, 32 GB)
  disco: string;            // Disco (ej. 512 GB NVMe SSD, 1 TB SSD)
  categoria: string;        // Categoría (Laptop, Desktop, Servidor, Switch, Impresora)
  departamento: string;     // Departamento (TI, Finanzas, Operaciones, Recursos Humanos)
  ubicacion: string;        // Ubicación (ej. Piso 3 - Oficina 302, Almacén TI)
  estado: EquipmentStatus;  // Estado del equipo
  notas?: string;           // Observaciones adicionales
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'in' | 'out' | 'assignment' | 'maintenance' | 'import' | 'edit';

export interface StockMovement {
  id: string;
  itemId: string;
  itemPlaca: string;
  itemNombre: string;
  type: MovementType;
  action: string;
  previousUser?: string;
  newUser?: string;
  reason: string;
  date: string;
}

export interface CsvColumnMapping {
  placa: string;
  nombreEquipo: string;
  usuario: string;
  fabricante: string;
  modelo: string;
  noSerie: string;
  direccionIp: string;
  versionSo: string;
  ram: string;
  disco: string;
  categoria: string;
  departamento: string;
  ubicacion: string;
  estado?: string;
  notas?: string;
}

export type DuplicateStrategy = 'overwrite' | 'skip';

export type EquipmentFilterStatus = 'all' | 'assigned' | 'available' | 'maintenance' | 'retired' | 'duplicates';

export interface SavedInventorySnapshot {
  id: string;
  name: string;
  date: string;
  itemCount: number;
  assignedCount: number;
  availableCount: number;
  maintenanceCount: number;
  items: InventoryItem[];
  notes?: string;
}
