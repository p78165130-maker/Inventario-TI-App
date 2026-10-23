import React, { useState, useEffect, useRef } from 'react';
import { X, ScanLine, Search, Laptop, UserCheck, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onQuickStatusChange: (item: InventoryItem) => void;
  onOpenEditItem: (item: InventoryItem) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  items,
  onQuickStatusChange,
  onOpenEditItem,
}) => {
  const [query, setQuery] = useState('');
  const [matchedItem, setMatchedItem] = useState<InventoryItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setMatchedItem(null);
      return;
    }

    const clean = query.trim().toLowerCase();
    const found = items.find(
      (item) =>
        item.placa.toLowerCase() === clean ||
        item.noSerie.toLowerCase() === clean ||
        item.nombreEquipo.toLowerCase() === clean ||
        item.usuario.toLowerCase().includes(clean)
    );

    setMatchedItem(found || null);
  }, [query, items]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Buscar o Escanear Placa / No. Serie
              </h2>
              <p className="text-xs text-slate-500">
                Lectura rápida con pistola de código de barras o búsqueda de Hostname
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

        {/* Input */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Escanea la placa con el lector óptico o escribe la placa/serie:
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pasa el escáner o escribe ej. TI-00101..."
                className="w-full pl-10 pr-4 py-2.5 text-sm font-mono border-2 border-slate-300 focus:border-slate-900 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10"
              />
              <ScanLine className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Matched item card */}
          {matchedItem ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 px-2 py-0.5 bg-white rounded border border-slate-200">
                      {matchedItem.placa}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{matchedItem.nombreEquipo}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-600">{matchedItem.categoria}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mt-1.5">
                    {matchedItem.fabricante} {matchedItem.modelo}
                  </h3>
                  <div className="text-xs text-slate-600 mt-1">
                    Usuario asignado: <strong className="text-slate-900">{matchedItem.usuario}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-200">
                    <div>S/N: <strong>{matchedItem.noSerie}</strong></div>
                    <div>IP: <strong>{matchedItem.direccionIp}</strong></div>
                    <div>RAM: <strong>{matchedItem.ram}</strong></div>
                    <div>Disco: <strong>{matchedItem.disco}</strong></div>
                    <div>Depto: <strong>{matchedItem.departamento}</strong></div>
                    <div>Ubicación: <strong>{matchedItem.ubicacion}</strong></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">Acción:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { onQuickStatusChange(matchedItem); onClose(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Cambiar Custodio / Estado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { onOpenEditItem(matchedItem); onClose(); }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Editar Ficha
                  </button>
                </div>
              </div>
            </div>
          ) : query.trim() ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-semibold block">Equipo no localizado</span>
                <span>No se encontró ningún equipo con la Placa, Serie o Hostname &quot;{query}&quot;.</span>
              </div>
            </div>
          ) : null}

          {/* Quick Click Simulators */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Prueba rápida (clic en cualquier Placa de muestra):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {items.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQuery(item.placa)}
                  className="px-2.5 py-1 text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  {item.placa}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
