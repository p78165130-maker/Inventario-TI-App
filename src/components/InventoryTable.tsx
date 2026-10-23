import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Laptop, 
  CheckSquare,
  Square,
  UserCheck,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { InventoryItem, EquipmentFilterStatus } from '../types/inventory';
import { ConfirmModal } from './ConfirmModal';
import { analyzeDuplicates } from '../utils/duplicates';

interface InventoryTableProps {
  items: InventoryItem[];
  onAddNewItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  onQuickStatusChange: (item: InventoryItem) => void;
  onDeleteItem: (item: InventoryItem) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onOpenImportModal: () => void;
  filterStatus: EquipmentFilterStatus;
  setFilterStatus: (status: EquipmentFilterStatus) => void;
  onOpenDuplicatesModal: () => void;
}

type SortField = 'placa' | 'nombreEquipo' | 'usuario' | 'fabricante' | 'modelo' | 'noSerie' | 'direccionIp' | 'versionSo' | 'ram' | 'disco' | 'categoria' | 'departamento' | 'ubicacion';
type SortOrder = 'asc' | 'desc';

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onAddNewItem,
  onEditItem,
  onQuickStatusChange,
  onDeleteItem,
  onDeleteMultiple,
  onOpenImportModal,
  filterStatus,
  setFilterStatus,
  onOpenDuplicatesModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('placa');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Duplicate analysis
  const duplicateAnalysis = useMemo(() => analyzeDuplicates(items), [items]);
  const { duplicateItemIds, itemMap, totalDuplicateItems } = duplicateAnalysis;

  // In-app modal deletion state (replaces window.confirm)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Distinct categories and departments
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.categoria) set.add(i.categoria);
    });
    return Array.from(set).sort();
  }, [items]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.departamento) set.add(i.departamento);
    });
    return Array.from(set).sort();
  }, [items]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Search query across all major fields
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPlaca = item.placa.toLowerCase().includes(q);
        const matchesNombre = item.nombreEquipo.toLowerCase().includes(q);
        const matchesUsuario = item.usuario.toLowerCase().includes(q);
        const matchesFabricante = item.fabricante.toLowerCase().includes(q);
        const matchesModelo = item.modelo.toLowerCase().includes(q);
        const matchesSerie = item.noSerie.toLowerCase().includes(q);
        const matchesIp = item.direccionIp.toLowerCase().includes(q);
        const matchesSo = item.versionSo.toLowerCase().includes(q);
        const matchesRam = item.ram.toLowerCase().includes(q);
        const matchesDisco = item.disco.toLowerCase().includes(q);
        const matchesCategoria = item.categoria.toLowerCase().includes(q);
        const matchesDepto = item.departamento.toLowerCase().includes(q);
        const matchesUbicacion = item.ubicacion.toLowerCase().includes(q);

        if (
          !matchesPlaca &&
          !matchesNombre &&
          !matchesUsuario &&
          !matchesFabricante &&
          !matchesModelo &&
          !matchesSerie &&
          !matchesIp &&
          !matchesSo &&
          !matchesRam &&
          !matchesDisco &&
          !matchesCategoria &&
          !matchesDepto &&
          !matchesUbicacion
        ) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && item.categoria !== selectedCategory) {
        return false;
      }

      // 3. Department filter
      if (selectedDepartment !== 'all' && item.departamento !== selectedDepartment) {
        return false;
      }

      // 4. Equipment Status / Duplicates filter
      if (filterStatus === 'assigned') {
        return item.estado === 'assigned';
      }
      if (filterStatus === 'available') {
        return item.estado === 'available';
      }
      if (filterStatus === 'maintenance') {
        return item.estado === 'maintenance' || item.estado === 'retired';
      }
      if (filterStatus === 'duplicates') {
        return duplicateItemIds.has(item.id);
      }

      return true;
    }).sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';

      return sortOrder === 'asc' 
        ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }) 
        : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [items, searchQuery, selectedCategory, selectedDepartment, filterStatus, sortField, sortOrder, duplicateItemIds]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmBulkDelete = () => {
    if (selectedIds.size === 0) return;
    onDeleteMultiple(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-slate-900 ml-1 inline" />
      : <ArrowDown className="w-3 h-3 text-slate-900 ml-1 inline" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      
      {/* Top Filter and Actions Toolbar */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Placa, Equipo, Usuario, Serie, IP, Fabricante..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setIsBulkDeleteOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar ({selectedIds.size})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenDuplicatesModal}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                totalDuplicateItems > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Abrir detector detallado de equipos repetidos o duplicados"
            >
              <Copy className="w-3.5 h-3.5 text-amber-600" />
              <span>Ver Repetidos ({totalDuplicateItems})</span>
            </button>

            <button
              type="button"
              onClick={onAddNewItem}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Equipo</span>
            </button>
          </div>
        </div>

        {/* Filters strip */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              onClick={() => setFilterStatus('assigned')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'assigned'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Asignados ({items.filter(i => i.estado === 'assigned').length})
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'available'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Disponibles ({items.filter(i => i.estado === 'available').length})
            </button>
            <button
              onClick={() => setFilterStatus('maintenance')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'maintenance'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mantenimiento ({items.filter(i => i.estado === 'maintenance' || i.estado === 'retired').length})
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === 'duplicates' ? 'all' : 'duplicates')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'duplicates'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : totalDuplicateItems > 0
                  ? 'text-amber-800 bg-amber-100/80 hover:bg-amber-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Filtrar equipos que tengan Placa, No. Serie o Nombre repetido"
            >
              <Copy className="w-3 h-3" />
              <span>Repetidos ({totalDuplicateItems})</span>
            </button>
          </div>

          {/* Category & Department Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Categoría:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="all">Todas ({categories.length})</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Departamento:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="all">Todos ({departments.length})</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicates Alert Banner */}
      {filterStatus === 'duplicates' && (
        <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Mostrando únicamente los <strong>{filteredItems.length} equipos</strong> con datos repetidos (Placa, No. Serie o Nombre duplicado).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenDuplicatesModal}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-semibold cursor-pointer text-xs shadow-2xs"
            >
              Comparar Grupos Repetidos
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-md font-medium cursor-pointer text-xs"
            >
              Ver Todos los Equipos
            </button>
          </div>
        </div>
      )}

      {/* Main Table with the 13 columns + Acciones */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Laptop className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            {items.length === 0 ? 'El inventario está vacío' : 'No se encontraron equipos con los filtros seleccionados'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {items.length === 0 
              ? 'Puedes importar un archivo CSV exportado desde Excel o comenzar a registrar tus equipos.' 
              : 'Prueba a limpiar la búsqueda o cambiar el departamento/categoría seleccionada.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onOpenImportModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Importar Archivo CSV
            </button>
            <button
              onClick={onAddNewItem}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Registrar Equipo Manual
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-semibold select-none sticky top-0">
              <tr>
                {/* Checkbox */}
                <th className="py-3 px-3 w-8 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label="Seleccionar todos"
                  >
                    {selectedIds.size > 0 && selectedIds.size === filteredItems.length ? (
                      <CheckSquare className="w-4 h-4 text-slate-900" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>

                {/* 1. Placa */}
                <th 
                  onClick={() => handleSort('placa')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    Placa {renderSortIcon('placa')}
                  </span>
                </th>

                {/* 2. Nombre de Equipo */}
                <th 
                  onClick={() => handleSort('nombreEquipo')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    Nombre de Equipo {renderSortIcon('nombreEquipo')}
                  </span>
                </th>

                {/* 3. Usuario */}
                <th 
                  onClick={() => handleSort('usuario')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    Usuario {renderSortIcon('usuario')}
                  </span>
                </th>

                {/* 4. Fabricante */}
                <th 
                  onClick={() => handleSort('fabricante')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    Fabricante {renderSortIcon('fabricante')}
                  </span>
                </th>

                {/* 5. Modelo */}
                <th 
                  onClick={() => handleSort('modelo')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    Modelo {renderSortIcon('modelo')}
                  </span>
                </th>

                {/* 6. No. Serie */}
                <th 
                  onClick={() => handleSort('noSerie')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    No. Serie {renderSortIcon('noSerie')}
                  </span>
                </th>

                {/* 7. Dirección IP */}
                <th 
                  onClick={() => handleSort('direccionIp')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    Dirección IP {renderSortIcon('direccionIp')}
                  </span>
                </th>

                {/* 8. Versión S.O. */}
                <th 
                  onClick={() => handleSort('versionSo')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    Versión S.O. {renderSortIcon('versionSo')}
                  </span>
                </th>

                {/* 9. RAM */}
                <th 
                  onClick={() => handleSort('ram')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    RAM {renderSortIcon('ram')}
                  </span>
                </th>

                {/* 10. Disco */}
                <th 
                  onClick={() => handleSort('disco')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    Disco {renderSortIcon('disco')}
                  </span>
                </th>

                {/* 11. Categoría */}
                <th 
                  onClick={() => handleSort('categoria')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    Categoría {renderSortIcon('categoria')}
                  </span>
                </th>

                {/* 12. Departamento */}
                <th 
                  onClick={() => handleSort('departamento')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    Departamento {renderSortIcon('departamento')}
                  </span>
                </th>

                {/* 13. Ubicación */}
                <th 
                  onClick={() => handleSort('ubicacion')} 
                  className="py-3 px-3 cursor-pointer group hover:text-slate-950"
                >
                  <span className="flex items-center">
                    Ubicación {renderSortIcon('ubicacion')}
                  </span>
                </th>

                {/* 14. Acciones (Sticky right) */}
                <th className="py-3 px-4 text-center sticky right-0 bg-slate-50/95 backdrop-blur-xs border-l border-slate-200">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                const isSelected = selectedIds.has(item.id);
                const isAvailable = item.estado === 'available';
                const isMaintenance = item.estado === 'maintenance';
                const isRetired = item.estado === 'retired';
                const dupInfo = itemMap.get(item.id);

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected 
                        ? 'bg-slate-50/90' 
                        : dupInfo?.isDuplicate 
                        ? 'bg-amber-50/35 hover:bg-amber-50/60' 
                        : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(item.id)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-slate-900" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* 1. Placa */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-slate-900">{item.placa}</span>
                        {dupInfo?.hasDuplicatePlaca && (
                          <span 
                            className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300" 
                            title="Placa repetida en otro equipo"
                          >
                            Repetida
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Nombre de Equipo */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-slate-900 font-mono">{item.nombreEquipo}</span>
                        {dupInfo?.hasDuplicateNombre && (
                          <span 
                            className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200" 
                            title="Nombre de equipo repetido"
                          >
                            Repetido
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Usuario */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">
                        {item.usuario}
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {isAvailable ? (
                          <span className="text-blue-600 font-medium">Disponible en Almacén</span>
                        ) : isMaintenance ? (
                          <span className="text-amber-600 font-medium">En Taller de Soporte</span>
                        ) : isRetired ? (
                          <span className="text-rose-600 font-medium">Dado de Baja</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Asignado Activo</span>
                        )}
                      </div>
                    </td>

                    {/* 4. Fabricante */}
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {item.fabricante}
                    </td>

                    {/* 5. Modelo */}
                    <td className="py-3 px-3 text-slate-700">
                      {item.modelo}
                    </td>

                    {/* 6. No. Serie */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-slate-600 text-[11px]">{item.noSerie}</span>
                        {dupInfo?.hasDuplicateSerie && (
                          <span 
                            className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200" 
                            title="Número de serie repetido en otro equipo"
                          >
                            Repetido
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 7. Dirección IP */}
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {item.direccionIp}
                    </td>

                    {/* 8. Versión S.O. */}
                    <td className="py-3 px-3 text-slate-600 text-xs">
                      {item.versionSo}
                    </td>

                    {/* 9. RAM */}
                    <td className="py-3 px-3 font-mono text-slate-800 font-medium">
                      {item.ram}
                    </td>

                    {/* 10. Disco */}
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {item.disco}
                    </td>

                    {/* 11. Categoría */}
                    <td className="py-3 px-3 text-slate-700">
                      {item.categoria}
                    </td>

                    {/* 12. Departamento */}
                    <td className="py-3 px-3 text-slate-700">
                      {item.departamento}
                    </td>

                    {/* 13. Ubicación */}
                    <td className="py-3 px-3 text-slate-600">
                      {item.ubicacion}
                    </td>

                    {/* 14. Acciones */}
                    <td className="py-3 px-4 text-center sticky right-0 bg-white/95 backdrop-blur-xs border-l border-slate-200">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onQuickStatusChange(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Cambiar estado o custodio"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Editar ficha del equipo"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Eliminar equipo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count indicator */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          <span>Mostrando <strong>{filteredItems.length}</strong> de <strong>{items.length}</strong> equipos registrados</span>
          {selectedDepartment !== 'all' && (
            <span> · Departamento: <strong>{selectedDepartment}</strong></span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{filteredItems.filter(i => i.estado === 'assigned').length} Asignados</span>
          <span aria-hidden="true">·</span>
          <span>{filteredItems.filter(i => i.estado === 'available').length} Libres en Almacén</span>
        </div>
      </div>

      {/* In-app Confirmation Modal for Single Item Delete */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteItem(itemToDelete);
            setItemToDelete(null);
          }
        }}
        title="¿Eliminar este equipo del inventario?"
        description={
          itemToDelete ? (
            <div className="space-y-2">
              <p>Esta acción dará de baja definitiva y eliminará el registro del equipo:</p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800 text-[11px] space-y-1">
                <div>Placa: <strong>{itemToDelete.placa}</strong></div>
                <div>Equipo: <strong>{itemToDelete.nombreEquipo}</strong></div>
                <div>Usuario: <span>{itemToDelete.usuario}</span></div>
                <div>Modelo: <span>{itemToDelete.fabricante} {itemToDelete.modelo}</span></div>
                {itemToDelete.noSerie && <div>Serie: <span>{itemToDelete.noSerie}</span></div>}
              </div>
            </div>
          ) : null
        }
        confirmText="Eliminar Equipo"
        isDestructive={true}
      />

      {/* In-app Confirmation Modal for Bulk Delete */}
      <ConfirmModal
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={() => {
          handleConfirmBulkDelete();
          setIsBulkDeleteOpen(false);
        }}
        title={`¿Eliminar los ${selectedIds.size} equipos seleccionados?`}
        description={
          <p>
            Se eliminarán definitivamente los <strong>{selectedIds.size}</strong> registros de hardware seleccionados. Esta operación se guardará en la auditoría de movimientos.
          </p>
        }
        confirmText={`Eliminar ${selectedIds.size} Equipos`}
        isDestructive={true}
      />

    </div>
  );
};
