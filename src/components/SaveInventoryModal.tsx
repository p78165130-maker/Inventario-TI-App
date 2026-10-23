import React, { useState } from 'react';
import { X, Check, Save, FileSpreadsheet, Download, Clock, Archive, FolderArchive } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { exportToCsv } from '../utils/csvParser';

interface SaveInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onConfirmSaveToMainMenu: (name: string, notes?: string) => void;
  lastSavedTime: string | null;
}

export const SaveInventoryModal: React.FC<SaveInventoryModalProps> = ({
  isOpen,
  onClose,
  items,
  onConfirmSaveToMainMenu,
  lastSavedTime,
}) => {
  const defaultName = `Inventario - ${new Date().toLocaleDateString('es-ES')} (${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`;
  const [inventoryName, setInventoryName] = useState(defaultName);
  const [saveNote, setSaveNote] = useState('');
  const [isSavedLocally, setIsSavedLocally] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const nowName = `Inventario - ${new Date().toLocaleDateString('es-ES')} (${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`;
      setInventoryName(nowName);
      setSaveNote('');
      setIsSavedLocally(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = items.length;
  const asignados = items.filter(i => i.estado === 'assigned').length;
  const disponibles = items.filter(i => i.estado === 'available').length;
  const mantenimiento = items.filter(i => i.estado === 'maintenance' || i.estado === 'retired').length;

  const handleSaveToMainMenu = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = inventoryName.trim() || defaultName;
    onConfirmSaveToMainMenu(finalName, saveNote.trim() || undefined);
    setIsSavedLocally(true);
    setTimeout(() => {
      setIsSavedLocally(false);
      onClose();
    }, 1000);
  };

  const handleDownloadExcelCsv = () => {
    const csvContent = exportToCsv(items, { delimiter: ';', includeBom: true });
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `inventario_equipos_${dateStr}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJsonBackup = () => {
    const backupData = {
      version: '2.0',
      type: 'inventariopro_ti_backup',
      savedAt: new Date().toISOString(),
      name: inventoryName || defaultName,
      note: saveNote || 'Cierre de inventario',
      totalItems: items.length,
      items: items,
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `respaldo_inventario_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Guardar Inventario en el Menú Principal
              </h2>
              <p className="text-xs text-slate-500">
                Archiva los {total} equipos actuales como un inventario guardado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSaveToMainMenu} className="p-6 space-y-4">
          {/* Summary Strip */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium text-slate-700">Resumen a Archivar:</span>
              {lastSavedTime && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Último: {lastSavedTime}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Total</span>
                <span className="text-sm font-bold font-mono text-slate-900">{total}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Asignados</span>
                <span className="text-sm font-bold font-mono text-emerald-700">{asignados}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">En Almacén</span>
                <span className="text-sm font-bold font-mono text-blue-700">{disponibles}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Mantenimiento</span>
                <span className="text-sm font-bold font-mono text-amber-700">{mantenimiento}</span>
              </div>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nombre para guardar este inventario en el menú: *
            </label>
            <input
              type="text"
              required
              value={inventoryName}
              onChange={(e) => setInventoryName(e.target.value)}
              placeholder="ej. Inventario General Octubre 2026"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600"
            />
          </div>

          {/* Note input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Notas u observaciones de este cierre:
            </label>
            <input
              type="text"
              value={saveNote}
              onChange={(e) => setSaveNote(e.target.value)}
              placeholder="ej. Auditoría anual completa, equipos verificados físicamente"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600"
            />
          </div>

          {/* Primary Action Button: Guardar en Menú Principal */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className={`w-full p-3 rounded-xl border text-center flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs ${
                isSavedLocally 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 font-semibold text-xs'
              }`}
            >
              {isSavedLocally ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Guardado con éxito en el Menú Principal!</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-4 h-4" />
                  <span>Guardar en Menú Principal y Reiniciar Mesa</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center leading-normal">
              ℹ️ Al pulsar guardar, los <strong>{total} equipos</strong> se archivarán permanentemente en <strong>Inventarios Guardados</strong> y la tabla activa se vaciará automáticamente para tu siguiente inventario.
            </p>
          </div>

          {/* Secondary backup download options */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              O descargar copia de respaldo:
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadExcelCsv}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left flex items-center justify-between text-xs text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Descargar CSV Excel</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={handleDownloadJsonBackup}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left flex items-center justify-between text-xs text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5 text-purple-600" />
                  <span>Descargar Backup JSON</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
