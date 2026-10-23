import React, { useState } from 'react';
import { X, History, Download, Search, UserCheck, Wrench, Package, UploadCloud } from 'lucide-react';
import { StockMovement } from '../types/inventory';

interface MovementsLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  movements: StockMovement[];
  onClearMovements: () => void;
}

export const MovementsLogModal: React.FC<MovementsLogModalProps> = ({
  isOpen,
  onClose,
  movements,
  onClearMovements,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filtered = movements.filter((mov) => {
    if (filterType !== 'all' && mov.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        mov.itemPlaca.toLowerCase().includes(q) ||
        mov.itemNombre.toLowerCase().includes(q) ||
        mov.action.toLowerCase().includes(q) ||
        mov.reason.toLowerCase().includes(q) ||
        (mov.newUser && mov.newUser.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportMovements = () => {
    const csvRows = [
      '\uFEFFFecha;Placa;Equipo;Operación;Custodio Anterior;Nuevo Custodio;Motivo',
      ...movements.map((m) => {
        const formattedDate = new Date(m.date).toLocaleString('es-ES');
        return `"${formattedDate}";"${m.itemPlaca}";"${m.itemNombre.replace(/"/g, '""')}";"${m.action}";"${(m.previousUser || '').replace(/"/g, '""')}";"${(m.newUser || '').replace(/"/g, '""')}";"${m.reason.replace(/"/g, '""')}"`;
      })
    ].join('\r\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historial_asignaciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (type: StockMovement['type'], action: string) => {
    switch (type) {
      case 'assignment':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-xs">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{action}</span>
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 text-xs">
            <Wrench className="w-3.5 h-3.5" />
            <span>{action}</span>
          </span>
        );
      case 'import':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-blue-700 text-xs">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{action}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 text-xs">
            <Package className="w-3.5 h-3.5" />
            <span>{action}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Historial de Asignaciones y Movimientos TI
              </h2>
              <p className="text-xs text-slate-500">
                Trazabilidad cronológica de entregas de equipos, altas, bajas y mantenimiento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMovements}
              disabled={movements.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Historial CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Placa, Equipo, Usuario o Ticket..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'assignment', label: 'Asignaciones' },
              { id: 'maintenance', label: 'Mantenimientos' },
              { id: 'import', label: 'Importaciones' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No hay movimientos registrados</p>
              <p className="text-xs text-slate-500 mt-0.5">Los cambios de asignación o altas de equipos aparecerán aquí.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Fecha y Hora</th>
                    <th className="py-2.5 px-3">Placa</th>
                    <th className="py-2.5 px-3">Equipo</th>
                    <th className="py-2.5 px-3">Operación</th>
                    <th className="py-2.5 px-3">Custodio Asignado</th>
                    <th className="py-2.5 px-3">Motivo / Ticket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 text-slate-500 font-mono">
                        {new Date(m.date).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{m.itemPlaca}</td>
                      <td className="py-2 px-3 font-mono text-slate-800">{m.itemNombre}</td>
                      <td className="py-2 px-3">{getActionBadge(m.type, m.action)}</td>
                      <td className="py-2 px-3 text-slate-800 font-medium">
                        {m.previousUser ? (
                          <span>
                            <span className="text-slate-400 line-through text-[11px] mr-1">{m.previousUser}</span>
                            <span>→ {m.newUser}</span>
                          </span>
                        ) : (
                          <span>{m.newUser || 'Almacén TI'}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-600 text-xs truncate max-w-[240px]">
                        {m.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer note */}
          <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
            <span>Mostrando {filtered.length} de {movements.length} eventos de auditoría</span>
            {movements.length > 0 && (
              <button
                type="button"
                onClick={onClearMovements}
                className="text-xs text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
              >
                Limpiar historial
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
