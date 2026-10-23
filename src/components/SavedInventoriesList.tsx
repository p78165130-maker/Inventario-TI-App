import React, { useState } from 'react';
import { 
  FolderArchive, 
  Download, 
  RotateCcw, 
  Trash2, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { SavedInventorySnapshot } from '../types/inventory';
import { exportToCsv } from '../utils/csvParser';
import { ConfirmModal } from './ConfirmModal';

interface SavedInventoriesListProps {
  savedInventories: SavedInventorySnapshot[];
  onLoadInventory: (snapshot: SavedInventorySnapshot) => void;
  onDeleteSavedInventory: (id: string) => void;
  onGoToActiveInventory: () => void;
}

export const SavedInventoriesList: React.FC<SavedInventoriesListProps> = ({
  savedInventories,
  onLoadInventory,
  onDeleteSavedInventory,
  onGoToActiveInventory,
}) => {
  const [snapshotToDelete, setSnapshotToDelete] = useState<SavedInventorySnapshot | null>(null);
  const [snapshotToLoad, setSnapshotToLoad] = useState<SavedInventorySnapshot | null>(null);

  const handleExportSnapshot = (snapshot: SavedInventorySnapshot) => {
    const csvContent = exportToCsv(snapshot.items, { delimiter: ';', includeBom: true });
    const cleanName = snapshot.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fileName = `${cleanName}_${new Date().toISOString().slice(0, 10)}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Inventarios Guardados en el Menú Principal
          </h2>
          <p className="text-xs text-slate-500">
            Historial de cierres y auditorías de inventario guardadas ({savedInventories.length} registros)
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToActiveInventory}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <span>Ir a Inventario Activo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {savedInventories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <FolderArchive className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            No tienes inventarios guardados en el menú aún
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            Cuando termines de realizar un inventario, pulsa el botón <strong>&quot;Guardar Inventario&quot;</strong> en la barra de acciones para archivarlo aquí permanentemente con su fecha y nombre.
          </p>
          <button
            type="button"
            onClick={onGoToActiveInventory}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Ver Inventario Activo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedInventories.map(inv => (
            <div 
              key={inv.id} 
              className="bg-white rounded-xl border border-slate-200 p-4.5 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {inv.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{inv.date}</span>
                    </div>
                  </div>

                  <span className="shrink-0 px-2.5 py-1 bg-slate-100 text-slate-800 font-mono text-xs font-bold rounded-lg border border-slate-200">
                    {inv.itemCount} equipos
                  </span>
                </div>

                {inv.notes && (
                  <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                    &quot;{inv.notes}&quot;
                  </p>
                )}

                {/* Breakdown metrics */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                  <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Asignados</span>
                    <span className="font-mono font-bold text-emerald-700">{inv.assignedCount}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">En Almacén</span>
                    <span className="font-mono font-bold text-blue-700">{inv.availableCount}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Mantenimiento</span>
                    <span className="font-mono font-bold text-amber-700">{inv.maintenanceCount}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSnapshotToLoad(inv)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Cargar este inventario guardado en la tabla activa"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cargar en Inventario Activo</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleExportSnapshot(inv)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Exportar copia en CSV de Excel"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSnapshotToDelete(inv)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar este guardado del menú"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation to Load snapshot into Active table */}
      <ConfirmModal
        isOpen={!!snapshotToLoad}
        onClose={() => setSnapshotToLoad(null)}
        onConfirm={() => {
          if (snapshotToLoad) {
            onLoadInventory(snapshotToLoad);
            setSnapshotToLoad(null);
          }
        }}
        title="¿Cargar este inventario en la tabla activa?"
        description={
          snapshotToLoad ? (
            <p>
              Se cargarán los <strong>{snapshotToLoad.itemCount} equipos</strong> de <strong>&quot;{snapshotToLoad.name}&quot;</strong> en la tabla de trabajo principal.
            </p>
          ) : null
        }
        confirmText="Cargar Inventario"
        isDestructive={false}
      />

      {/* Confirmation to Delete snapshot */}
      <ConfirmModal
        isOpen={!!snapshotToDelete}
        onClose={() => setSnapshotToDelete(null)}
        onConfirm={() => {
          if (snapshotToDelete) {
            onDeleteSavedInventory(snapshotToDelete.id);
            setSnapshotToDelete(null);
          }
        }}
        title="¿Eliminar este inventario guardado?"
        description={
          snapshotToDelete ? (
            <p>
              Se eliminará del menú principal la copia guardada <strong>&quot;{snapshotToDelete.name}&quot;</strong> del {snapshotToDelete.date}.
            </p>
          ) : null
        }
        confirmText="Eliminar del Menú"
        isDestructive={true}
      />
    </div>
  );
};
