import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Check, Info } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { exportToCsv } from '../utils/csvParser';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allItems: InventoryItem[];
  filteredItems: InventoryItem[];
}

export const CsvExportModal: React.FC<CsvExportModalProps> = ({
  isOpen,
  onClose,
  allItems,
  filteredItems,
}) => {
  const [delimiter, setDelimiter] = useState<string>(';');
  const [includeBom, setIncludeBom] = useState<boolean>(true);
  const [scope, setScope] = useState<'all' | 'filtered' | 'available'>('all');

  if (!isOpen) return null;

  const availableItems = allItems.filter(i => i.estado === 'available');

  const getTargetItems = (): InventoryItem[] => {
    switch (scope) {
      case 'filtered':
        return filteredItems;
      case 'available':
        return availableItems;
      case 'all':
      default:
        return allItems;
    }
  };

  const handleDownload = () => {
    const itemsToExport = getTargetItems();
    const csvContent = exportToCsv(itemsToExport, {
      delimiter,
      includeBom,
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `inventario_equipos_${scope}_${dateStr}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const targetCount = getTargetItems().length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Exportar Inventario de Equipos a CSV
              </h2>
              <p className="text-xs text-slate-500">
                Genera archivo con Placa, Nombre de Equipo, Usuario, Especificaciones y Ubicación
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

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Scope selection */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-2">
              ¿Qué equipos deseas exportar?
            </label>
            <div className="space-y-2">
              <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                scope === 'all' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:bg-slate-50/60'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="exportScope"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                    className="text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs font-medium text-slate-800">Todos los equipos</span>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {allItems.length} Equipos
                </span>
              </label>

              {filteredItems.length !== allItems.length && (
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  scope === 'filtered' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:bg-slate-50/60'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={scope === 'filtered'}
                      onChange={() => setScope('filtered')}
                      className="text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-xs font-medium text-slate-800">Solo la vista / filtro actual</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {filteredItems.length} Equipos
                  </span>
                </label>
              )}

              <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                scope === 'available' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:bg-slate-50/60'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="exportScope"
                    checked={scope === 'available'}
                    onChange={() => setScope('available')}
                    className="text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs font-medium text-slate-800">Solo equipos disponibles en almacén</span>
                </div>
                <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {availableItems.length} Equipos
                </span>
              </label>
            </div>
          </div>

          {/* Delimiter selection */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-2">
              Formato de separador para Excel:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                delimiter === ';' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:bg-slate-50/60'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="delimiter"
                    checked={delimiter === ';'}
                    onChange={() => setDelimiter(';')}
                    className="text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs font-semibold text-slate-900">Punto y coma ( ; )</span>
                </div>
                <span className="text-[11px] text-slate-500 block pl-5">
                  Recomendado para Microsoft Excel en Español.
                </span>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                delimiter === ',' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:bg-slate-50/60'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="delimiter"
                    checked={delimiter === ','}
                    onChange={() => setDelimiter(',')}
                    className="text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs font-semibold text-slate-900">Coma ( , )</span>
                </div>
                <span className="text-[11px] text-slate-500 block pl-5">
                  Estándar internacional o Google Sheets.
                </span>
              </label>
            </div>
          </div>

          {/* UTF-8 BOM */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="includeBom"
              checked={includeBom}
              onChange={(e) => setIncludeBom(e.target.checked)}
              className="mt-0.5 rounded text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="includeBom" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-semibold text-slate-900 block">Codificación UTF-8 con BOM</span>
              <span>
                Permite que Excel abra directamente tildes, eñes y caracteres especiales sin deformar el texto.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={targetCount === 0}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-200" />
            <span>Descargar CSV ({targetCount} equipos)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
