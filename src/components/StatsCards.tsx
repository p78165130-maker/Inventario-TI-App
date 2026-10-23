import React from 'react';
import { Monitor, UserCheck, Package, Wrench, Copy, AlertTriangle } from 'lucide-react';
import { InventoryItem, EquipmentFilterStatus } from '../types/inventory';

interface StatsCardsProps {
  items: InventoryItem[];
  activeFilter: EquipmentFilterStatus;
  onFilterChange: (status: EquipmentFilterStatus) => void;
  duplicateCount?: number;
  onShowDuplicates?: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  items,
  activeFilter,
  onFilterChange,
  duplicateCount = 0,
  onShowDuplicates,
}) => {
  const totalEquipos = items.length;
  const asignados = items.filter(i => i.estado === 'assigned').length;
  const disponibles = items.filter(i => i.estado === 'available').length;
  const mantenimiento = items.filter(i => i.estado === 'maintenance' || i.estado === 'retired').length;

  const pctAsignados = totalEquipos > 0 ? Math.round((asignados / totalEquipos) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Activos */}
      <div 
        onClick={() => onFilterChange('all')}
        className={`bg-white rounded-xl border p-4.5 cursor-pointer transition-all ${
          activeFilter === 'all' 
            ? 'border-slate-900 ring-1 ring-slate-900/15' 
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Total de Equipos TI</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Monitor className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {totalEquipos}
          </span>
          <span className="text-xs text-slate-500">activos registrados</span>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Catálogo completo de hardware corporativo
        </div>
      </div>

      {/* Asignados a Usuarios */}
      <div 
        onClick={() => onFilterChange('assigned')}
        className={`bg-white rounded-xl border p-4.5 cursor-pointer transition-all ${
          activeFilter === 'assigned' 
            ? 'border-emerald-600 ring-1 ring-emerald-600/15' 
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Equipos Asignados</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-700 font-mono">
            {asignados}
          </span>
          <span className="text-xs text-slate-500">en uso ({pctAsignados}%)</span>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Custodiados por colaboradores o servidores activos
        </div>
      </div>

      {/* Disponibles / Reserva */}
      <div 
        onClick={() => onFilterChange('available')}
        className={`bg-white rounded-xl border p-4.5 cursor-pointer transition-all ${
          activeFilter === 'available' 
            ? 'border-blue-600 ring-1 ring-blue-600/15' 
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">En Reserva / Almacén</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-blue-700 font-mono">
            {disponibles}
          </span>
          <span className="text-xs text-slate-500">libres para entrega</span>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Stock listo para nuevas incorporaciones o reemplazos
        </div>
      </div>

      {/* Mantenimiento / Baja */}
      <div 
        onClick={() => onFilterChange('maintenance')}
        className={`bg-white rounded-xl border p-4.5 cursor-pointer transition-all ${
          activeFilter === 'maintenance' 
            ? 'border-amber-600 ring-1 ring-amber-600/15' 
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Taller / Mantenimiento</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight font-mono ${
            mantenimiento > 0 ? 'text-amber-700' : 'text-slate-900'
          }`}>
            {mantenimiento}
          </span>
          <span className="text-xs text-slate-500">en revisión</span>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Equipos en reparación o pendientes de baja
        </div>
      </div>

      {/* Duplicate alert banner if duplicates exist */}
      {duplicateCount > 0 && (
        <div className="sm:col-span-2 lg:col-span-4 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block sm:inline">¡Atención de Auditoría! </span>
              <span>
                Se detectaron <strong>{duplicateCount} equipos repetidos</strong> con la misma Placa, No. Serie o Nombre en el inventario.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onShowDuplicates}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer shrink-0 transition-colors shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Ver Repetidos ({duplicateCount})</span>
          </button>
        </div>
      )}
    </div>
  );
};
