import React, { useState } from 'react';
import { X, Check, UserCheck, Wrench, Package, AlertTriangle } from 'lucide-react';
import { InventoryItem, EquipmentStatus } from '../types/inventory';

interface StatusAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onConfirmChange: (
    item: InventoryItem,
    newStatus: EquipmentStatus,
    newUsuario: string,
    newUbicacion: string,
    newDepartamento: string,
    reason: string
  ) => void;
}

export const StatusAssignModal: React.FC<StatusAssignModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirmChange,
}) => {
  const [status, setStatus] = useState<EquipmentStatus>('assigned');
  const [usuario, setUsuario] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [reason, setReason] = useState('');

  React.useEffect(() => {
    if (item) {
      setStatus(item.estado || 'assigned');
      setUsuario(item.usuario || '');
      setUbicacion(item.ubicacion || '');
      setDepartamento(item.departamento || '');
      setReason('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason.trim() || `Actualización de estado a ${status === 'assigned' ? 'Asignado' : status === 'available' ? 'Disponible en Almacén' : 'Mantenimiento'}`;
    onConfirmChange(item, status, usuario, ubicacion, departamento, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Asignación y Estado de Equipo
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-mono font-bold text-slate-800">{item.placa}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{item.nombreEquipo}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Estado Operativo:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setStatus('assigned');
                  if (usuario.toLowerCase().includes('disponible')) setUsuario('');
                }}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  status === 'assigned' ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold ring-1 ring-emerald-600' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Asignado a Usuario</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('available');
                  setUsuario('Disponible (Sin asignar)');
                  setUbicacion('Almacén TI');
                }}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  status === 'available' ? 'bg-blue-50 border-blue-600 text-blue-800 font-semibold ring-1 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4 text-blue-600" />
                <span>En Almacén / Libre</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('maintenance');
                  setUsuario('Taller de Soporte');
                  setUbicacion('Taller TI');
                }}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  status === 'maintenance' ? 'bg-amber-50 border-amber-600 text-amber-800 font-semibold ring-1 ring-amber-600' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>En Mantenimiento</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('retired');
                  setUsuario('De Baja');
                }}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  status === 'retired' ? 'bg-rose-50 border-rose-600 text-rose-800 font-semibold ring-1 ring-rose-600' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Dado de Baja</span>
              </button>
            </div>
          </div>

          {/* Usuario custodio */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Usuario Custodio / Responsable:
            </label>
            <input
              type="text"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Nombre del colaborador o área"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          {/* Departamento y Ubicación */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Departamento:
              </label>
              <input
                type="text"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                placeholder="ej. Finanzas"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ubicación Física:
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="ej. Piso 3 · Of. 302"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>
          </div>

          {/* Motivo del cambio */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Motivo o Referencia (Ticket / Incidente):
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ej. Entrega a nuevo ingreso o Ticket #T-1029"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Asignación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
