import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  AlertTriangle, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  Tag,
  Hash,
  Monitor,
  User,
  MapPin,
  Building2
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { DuplicateGroup, DuplicateType, analyzeDuplicates } from '../utils/duplicates';
import { ConfirmModal } from './ConfirmModal';

interface DuplicatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (item: InventoryItem) => void;
  onViewInTable: () => void;
  onCreateTestDuplicate?: () => void;
}

export const DuplicatesModal: React.FC<DuplicatesModalProps> = ({
  isOpen,
  onClose,
  items,
  onEditItem,
  onDeleteItem,
  onViewInTable,
  onCreateTestDuplicate,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | DuplicateType>('all');
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  if (!isOpen) return null;

  const analysis = analyzeDuplicates(items);
  const { groups, totalDuplicateItems, placaDuplicatesCount, serieDuplicatesCount, nombreDuplicatesCount } = analysis;

  const filteredGroups = activeTab === 'all' 
    ? groups 
    : groups.filter(g => g.type === activeTab);

  const getStatusBadge = (status: InventoryItem['estado']) => {
    switch (status) {
      case 'assigned':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Asignado</span>;
      case 'available':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">En Almacén</span>;
      case 'maintenance':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Mantenimiento</span>;
      case 'retired':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Baja</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              totalDuplicateItems > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {totalDuplicateItems > 0 ? (
                <Copy className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">
                  Detector de Equipos Repetidos
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                  totalDuplicateItems > 0 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {totalDuplicateItems > 0 ? `${totalDuplicateItems} equipos repetidos` : 'Sin repetidos'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Auditoría automática de duplicidad por Placa (Asset Tag), No. Serie o Nombre de Equipo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalDuplicateItems > 0 && (
              <button
                type="button"
                onClick={() => {
                  onViewInTable();
                  onClose();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <span>Filtrar en la Tabla</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos los Grupos ({groups.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('placa')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'placa'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>Por Placa ({placaDuplicatesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('noSerie')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'noSerie'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hash className="w-3.5 h-3.5 text-purple-600" />
            <span>Por No. Serie ({serieDuplicatesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nombreEquipo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'nombreEquipo'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-blue-600" />
            <span>Por Nombre de Equipo ({nombreDuplicatesCount})</span>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {groups.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                ¡No hay equipos repetidos en el inventario!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                Todas las Placas (Asset Tags), Números de Serie y Nombres de Equipo son únicos. No se detectaron colisiones de datos.
              </p>
              {onCreateTestDuplicate && items.length > 0 && (
                <button
                  type="button"
                  onClick={onCreateTestDuplicate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Crear equipo repetido de prueba</span>
                </button>
              )}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No hay repetidos en la categoría seleccionada ({activeTab}).
            </div>
          ) : (
            filteredGroups.map(group => (
              <div 
                key={group.id} 
                className="bg-white rounded-xl border border-amber-200 shadow-2xs overflow-hidden"
              >
                {/* Group Banner */}
                <div className="px-4 py-2.5 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      {group.typeLabel}:
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-amber-900 border border-amber-300">
                      &quot;{group.value}&quot;
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                    {group.items.length} equipos con este mismo valor
                  </span>
                </div>

                {/* Items in this group */}
                <div className="divide-y divide-slate-100">
                  {group.items.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            Placa: {item.placa}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs font-semibold text-slate-800">
                            {item.nombreEquipo}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs text-slate-600">
                            {item.fabricante} {item.modelo}
                          </span>
                          {getStatusBadge(item.estado)}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 pt-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate"><strong>Usuario:</strong> {item.usuario || 'Sin asignar'}</span>
                          </div>

                          <div className="flex items-center gap-1.5 truncate">
                            <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-mono text-[11px] truncate">
                              <strong>S/N:</strong> {item.noSerie || 'N/A'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate"><strong>Depto:</strong> {item.departamento}</span>
                          </div>

                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate"><strong>Ubicación:</strong> {item.ubicacion}</span>
                          </div>
                        </div>

                        {item.direccionIp && item.direccionIp !== 'DHCP' && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            IP: {item.direccionIp} · RAM: {item.ram} · Disco: {item.disco}
                          </div>
                        )}
                      </div>

                      {/* Action buttons for this specific duplicate */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onEditItem(item);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Editar los datos o cambiar la placa / serie de este equipo"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Eliminar este registro repetido"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="text-xs text-slate-500">
            {totalDuplicateItems > 0 ? (
              <span>Consejo: Puedes editar la placa/serie o eliminar los duplicados sobrantes.</span>
            ) : (
              <span>Todos los registros tienen identificadores únicos.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {totalDuplicateItems > 0 && (
              <button
                type="button"
                onClick={() => {
                  onViewInTable();
                  onClose();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Ver en la Tabla de Trabajo
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation modal to delete a duplicate item safely */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteItem(itemToDelete);
            setItemToDelete(null);
          }
        }}
        title="¿Eliminar este equipo duplicado?"
        description={
          itemToDelete ? (
            <p>
              Se eliminará del inventario el equipo con Placa <strong>{itemToDelete.placa}</strong> ({itemToDelete.nombreEquipo} - {itemToDelete.usuario}).
            </p>
          ) : null
        }
        confirmText="Sí, Eliminar Duplicado"
        isDestructive={true}
      />
    </div>
  );
};
