import React, { useState, useEffect } from 'react';
import { X, Check, Laptop, Sparkles, AlertCircle } from 'lucide-react';
import { InventoryItem, EquipmentStatus } from '../types/inventory';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  itemToEdit?: InventoryItem | null;
  existingCategories: string[];
  existingDepartments: string[];
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  existingCategories,
  existingDepartments,
}) => {
  const [placa, setPlaca] = useState('');
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [modelo, setModelo] = useState('');
  const [noSerie, setNoSerie] = useState('');
  const [direccionIp, setDireccionIp] = useState('');
  const [versionSo, setVersionSo] = useState('');
  const [ram, setRam] = useState('');
  const [disco, setDisco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [estado, setEstado] = useState<EquipmentStatus>('assigned');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setPlaca(itemToEdit.placa || '');
      setNombreEquipo(itemToEdit.nombreEquipo || '');
      setUsuario(itemToEdit.usuario || '');
      setFabricante(itemToEdit.fabricante || '');
      setModelo(itemToEdit.modelo || '');
      setNoSerie(itemToEdit.noSerie || '');
      setDireccionIp(itemToEdit.direccionIp || '');
      setVersionSo(itemToEdit.versionSo || '');
      setRam(itemToEdit.ram || '');
      setDisco(itemToEdit.disco || '');
      setCategoria(itemToEdit.categoria || 'Laptop');
      setDepartamento(itemToEdit.departamento || 'Tecnología');
      setUbicacion(itemToEdit.ubicacion || '');
      setEstado(itemToEdit.estado || 'assigned');
      setNotas(itemToEdit.notas || '');
    } else {
      // Defaults for new equipment
      const autoNum = Math.floor(1000 + Math.random() * 9000);
      setPlaca(`TI-${autoNum}`);
      setNombreEquipo(`CORP-LAP-${autoNum.toString().slice(-3)}`);
      setUsuario('');
      setFabricante('Dell');
      setModelo('Latitude 5430');
      setNoSerie('');
      setDireccionIp('DHCP');
      setVersionSo('Windows 11 Pro 23H2');
      setRam('16 GB DDR4');
      setDisco('512 GB NVMe SSD');
      setCategoria(existingCategories[0] || 'Laptop');
      setDepartamento(existingDepartments[0] || 'Tecnología');
      setUbicacion('Piso 3 · Sede Principal');
      setEstado('assigned');
      setNotas('');
    }
    setError(null);
  }, [itemToEdit, isOpen, existingCategories, existingDepartments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim()) {
      setError('La Placa de inventario es obligatoria.');
      return;
    }
    if (!nombreEquipo.trim()) {
      setError('El Nombre del Equipo (Hostname) es obligatorio.');
      return;
    }

    const now = new Date().toISOString();
    const finalItem: InventoryItem = {
      id: itemToEdit?.id || `eq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      placa: placa.trim().toUpperCase(),
      nombreEquipo: nombreEquipo.trim().toUpperCase(),
      usuario: usuario.trim() || 'Disponible (Sin asignar)',
      fabricante: fabricante.trim() || 'Genérico',
      modelo: modelo.trim() || 'Sin modelo',
      noSerie: noSerie.trim().toUpperCase() || 'S/N no especificado',
      direccionIp: direccionIp.trim() || 'DHCP',
      versionSo: versionSo.trim() || 'N/A',
      ram: ram.trim() || '8 GB',
      disco: disco.trim() || '256 GB',
      categoria: categoria.trim() || 'Laptop',
      departamento: departamento.trim() || 'General',
      ubicacion: ubicacion.trim() || 'Almacén TI',
      estado,
      notas: notas.trim() || undefined,
      createdAt: itemToEdit?.createdAt || now,
      updatedAt: now,
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Laptop className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {itemToEdit ? 'Editar Ficha de Equipo' : 'Registrar Nuevo Equipo en Inventario'}
              </h2>
              <p className="text-xs text-slate-500">
                {itemToEdit ? `Modificando Placa: ${itemToEdit.placa} (${itemToEdit.nombreEquipo})` : 'Ingresa los datos técnicos y asignación del activo TI'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Placa, Nombre de Equipo, No. Serie */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Placa (Asset Tag) *
              </label>
              <input
                type="text"
                required
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="ej. TI-00124"
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nombre de Equipo (Hostname) *
              </label>
              <input
                type="text"
                required
                value={nombreEquipo}
                onChange={(e) => setNombreEquipo(e.target.value.toUpperCase())}
                placeholder="ej. CORP-LAP-042"
                className="w-full px-3 py-2 text-xs font-mono font-semibold border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                No. Serie (S/N)
              </label>
              <input
                type="text"
                value={noSerie}
                onChange={(e) => setNoSerie(e.target.value.toUpperCase())}
                placeholder="ej. 8GK3M42"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>
          </div>

          {/* Row 2: Usuario y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Usuario Asignado
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="ej. Carlos Mendoza (o deja vacío para Disponible)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Estado del Equipo
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EquipmentStatus)}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer"
              >
                <option value="assigned">Asignado (En uso)</option>
                <option value="available">Disponible (En Almacén)</option>
                <option value="maintenance">En Mantenimiento</option>
                <option value="retired">De Baja</option>
              </select>
            </div>
          </div>

          {/* Row 3: Fabricante, Modelo, Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Fabricante
              </label>
              <input
                type="text"
                value={fabricante}
                onChange={(e) => setFabricante(e.target.value)}
                placeholder="ej. Dell, HP, Lenovo, Apple, Cisco"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Modelo
              </label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="ej. Latitude 5430, ThinkPad T14"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Categoría
              </label>
              <input
                type="text"
                list="category-options"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="ej. Laptop, Desktop, Servidor..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              <datalist id="category-options">
                <option value="Laptop" />
                <option value="Desktop" />
                <option value="Servidor" />
                <option value="Switch de Red" />
                <option value="Impresora" />
                <option value="Monitor" />
                <option value="Tablet" />
              </datalist>
            </div>
          </div>

          {/* Technical Specs box: IP, SO, RAM, Disco */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Especificaciones Técnicas de Hardware y Red
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Dirección IP
                </label>
                <input
                  type="text"
                  value={direccionIp}
                  onChange={(e) => setDireccionIp(e.target.value)}
                  placeholder="ej. 192.168.1.45"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Versión S.O.
                </label>
                <input
                  type="text"
                  value={versionSo}
                  onChange={(e) => setVersionSo(e.target.value)}
                  placeholder="ej. Windows 11 Pro 23H2"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  RAM
                </label>
                <input
                  type="text"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  placeholder="ej. 16 GB DDR4"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Disco
                </label>
                <input
                  type="text"
                  value={disco}
                  onChange={(e) => setDisco(e.target.value)}
                  placeholder="ej. 512 GB NVMe SSD"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Department and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Departamento
              </label>
              <input
                type="text"
                list="department-options"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                placeholder="ej. Finanzas, Tecnología, Operaciones..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              <datalist id="department-options">
                {existingDepartments.map(d => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ubicación Física
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="ej. Piso 3 · Oficina 304 o Sede Central"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Notas u Observaciones
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Periféricos asignados, número de ticket o información de soporte"
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
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4 text-slate-200" />
              <span>{itemToEdit ? 'Guardar Cambios' : 'Registrar Equipo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
