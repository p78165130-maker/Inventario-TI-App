import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Upload, 
  Save, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Clock,
  FolderArchive,
  Laptop,
  Copy
} from 'lucide-react';
import { InventoryItem, StockMovement, DuplicateStrategy, EquipmentFilterStatus, EquipmentStatus, SavedInventorySnapshot } from './types/inventory';
import { INITIAL_INVENTORY, INITIAL_MOVEMENTS } from './utils/sampleData';
import { getSampleCsvTemplate, fixMojibake } from './utils/csvParser';
import { analyzeDuplicates } from './utils/duplicates';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { InventoryTable } from './components/InventoryTable';
import { CsvImportWizard } from './components/CsvImportWizard';
import { CsvExportModal } from './components/CsvExportModal';
import { ItemModal } from './components/ItemModal';
import { StatusAssignModal } from './components/StatusAssignModal';
import { MovementsLogModal } from './components/MovementsLogModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SaveInventoryModal } from './components/SaveInventoryModal';
import { SavedInventoriesList } from './components/SavedInventoriesList';
import { DuplicatesModal } from './components/DuplicatesModal';

const STORAGE_KEY_ITEMS = 'inventariopro_ti_equipos_v2';
const STORAGE_KEY_MOVEMENTS = 'inventariopro_ti_movimientos_v2';
const STORAGE_KEY_LAST_SAVED = 'inventariopro_ti_last_saved_v2';
const STORAGE_KEY_SAVED_INVENTORIES = 'inventariopro_ti_saved_inventories_v1';

function sanitizeItem(item: InventoryItem): InventoryItem {
  return {
    ...item,
    placa: fixMojibake(item.placa || ''),
    nombreEquipo: fixMojibake(item.nombreEquipo || ''),
    usuario: fixMojibake(item.usuario || ''),
    fabricante: fixMojibake(item.fabricante || ''),
    modelo: fixMojibake(item.modelo || ''),
    noSerie: fixMojibake(item.noSerie || ''),
    direccionIp: fixMojibake(item.direccionIp || ''),
    versionSo: fixMojibake(item.versionSo || ''),
    ram: fixMojibake(item.ram || ''),
    disco: fixMojibake(item.disco || ''),
    categoria: fixMojibake(item.categoria || ''),
    departamento: fixMojibake(item.departamento || ''),
    ubicacion: fixMojibake(item.ubicacion || ''),
    notas: item.notas ? fixMojibake(item.notas) : undefined,
  };
}

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeItem);
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_INVENTORY.map(sanitizeItem);
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MOVEMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_MOVEMENTS;
  });

  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_LAST_SAVED) || null;
    } catch {
      return null;
    }
  });

  // Current view: 'inventory' for active table, 'saved' for saved snapshots list
  const [currentView, setCurrentView] = useState<'inventory' | 'saved'>('inventory');

  // Saved Inventories stored in the Main Menu
  const [savedInventories, setSavedInventories] = useState<SavedInventorySnapshot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_INVENTORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((snap: SavedInventorySnapshot) => ({
            ...snap,
            items: Array.isArray(snap.items) ? snap.items.map(sanitizeItem) : [],
          }));
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [filterStatus, setFilterStatus] = useState<EquipmentFilterStatus>('all');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMovementsOpen, setIsMovementsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [itemToAssign, setItemToAssign] = useState<InventoryItem | null>(null);

  // New Save and Clear Inventory states
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
  const [isDuplicatesModalOpen, setIsDuplicatesModalOpen] = useState(false);

  // Automatic Duplicate Analysis
  const duplicateAnalysis = useMemo(() => analyzeDuplicates(items), [items]);

  // In-app confirmation dialogs (replaces window.confirm)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearMovementsConfirmOpen, setIsClearMovementsConfirmOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(movements));
    } catch {
      // ignore
    }
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_INVENTORIES, JSON.stringify(savedInventories));
    } catch {
      // ignore
    }
  }, [savedInventories]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const logMovement = (
    item: InventoryItem,
    type: StockMovement['type'],
    action: string,
    previousUser: string | undefined,
    newUser: string,
    reason: string
  ) => {
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemId: item.id,
      itemPlaca: item.placa,
      itemNombre: item.nombreEquipo,
      type,
      action,
      previousUser,
      newUser,
      reason,
      date: new Date().toISOString(),
    };
    setMovements(prev => [newMovement, ...prev]);
  };

  // CSV Import handler
  const handleImportSuccess = (importedItems: InventoryItem[], strategy: DuplicateStrategy) => {
    if (importedItems.length === 0) return;

    setItems(currentItems => {
      const itemMap = new Map<string, InventoryItem>();
      currentItems.forEach(i => itemMap.set(i.placa.trim().toLowerCase(), { ...i }));

      let updatedCount = 0;
      let addedCount = 0;
      let skippedCount = 0;

      importedItems.forEach(rawIncoming => {
        const incoming = sanitizeItem(rawIncoming);
        const key = incoming.placa.trim().toLowerCase();
        const existing = itemMap.get(key);

        if (!existing) {
          itemMap.set(key, incoming);
          addedCount++;
          logMovement(incoming, 'import', 'Alta por CSV', undefined, incoming.usuario, 'Importación masiva desde archivo CSV');
        } else {
          if (strategy === 'overwrite') {
            const updated: InventoryItem = {
              ...incoming,
              id: existing.id,
              createdAt: existing.createdAt,
              updatedAt: new Date().toISOString(),
            };
            itemMap.set(key, updated);
            updatedCount++;
            logMovement(updated, 'import', 'Actualización por CSV', existing.usuario, incoming.usuario, 'Actualización de datos por importación CSV');
          } else {
            skippedCount++;
          }
        }
      });

      showToast(
        `Importación finalizada: ${addedCount} equipos nuevos incorporados, ${updatedCount} actualizados${skippedCount > 0 ? `, ${skippedCount} omitidos` : ''}.`,
        'success'
      );

      return Array.from(itemMap.values());
    });
  };

  // Create or Update single item
  const handleSaveItem = (rawItem: InventoryItem) => {
    const item = sanitizeItem(rawItem);
    const existingIndex = items.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      const prev = items[existingIndex];
      const userChanged = prev.usuario !== item.usuario;
      setItems(current => current.map(i => i.id === item.id ? item : i));
      if (userChanged) {
        logMovement(item, 'assignment', 'Cambio de Custodio', prev.usuario, item.usuario, 'Actualización en ficha de equipo');
      }
      showToast(`Equipo con Placa ${item.placa} actualizado.`);
    } else {
      setItems(current => [item, ...current]);
      logMovement(item, 'in', 'Alta de Equipo', undefined, item.usuario, 'Registro manual en inventario');
      showToast(`Nuevo equipo ${item.placa} (${item.nombreEquipo}) registrado.`);
    }
  };

  // Status / Custody change handler
  const handleConfirmStatusChange = (
    item: InventoryItem,
    newStatus: EquipmentStatus,
    newUsuario: string,
    newUbicacion: string,
    newDepartamento: string,
    reason: string
  ) => {
    const previousUser = item.usuario;
    const updated: InventoryItem = sanitizeItem({
      ...item,
      estado: newStatus,
      usuario: newUsuario,
      ubicacion: newUbicacion,
      departamento: newDepartamento,
      updatedAt: new Date().toISOString(),
    });

    setItems(current => current.map(i => i.id === item.id ? updated : i));

    const movType = newStatus === 'maintenance' ? 'maintenance' : 'assignment';
    const actionLabel = newStatus === 'assigned' 
      ? 'Asignación a Usuario' 
      : newStatus === 'available' 
      ? 'Devuelto a Almacén' 
      : newStatus === 'maintenance' 
      ? 'Pase a Mantenimiento' 
      : 'Baja de Equipo';

    logMovement(updated, movType, actionLabel, previousUser, newUsuario, reason);
    showToast(`Placa ${item.placa}: ${actionLabel} registrado.`);
  };

  // Delete single item (guaranteed execution, no window.confirm)
  const handleDeleteItem = (item: InventoryItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    logMovement(item, 'out', 'Baja y Retiro', item.usuario, 'N/A', `Eliminación de inventario: ${item.nombreEquipo}`);
    showToast(`Equipo con Placa ${item.placa} eliminado exitosamente.`, 'info');
  };

  // Delete multiple items (guaranteed execution, no window.confirm)
  const handleDeleteMultiple = (ids: string[]) => {
    const idSet = new Set(ids);
    setItems(prev => prev.filter(i => !idSet.has(i.id)));
    showToast(`Se eliminaron ${ids.length} equipos del inventario.`, 'info');
  };

  // Clear ALL inventory (start completely from scratch)
  const handleClearAllInventory = () => {
    const count = items.length;
    setItems([]);
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify([]));
    } catch {
      // ignore
    }
    showToast(`El inventario ha sido vaciado (${count} equipos eliminados). Listo para registrar o importar.`, 'info');
  };

  // Save Inventory to Main Menu handler: saves snapshot and automatically clears active inventory
  const handleConfirmSaveToMainMenu = (name: string, notes?: string) => {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

    const countBeforeSave = items.length;
    const asignados = items.filter(i => i.estado === 'assigned').length;
    const disponibles = items.filter(i => i.estado === 'available').length;
    const mantenimiento = items.filter(i => i.estado === 'maintenance' || i.estado === 'retired').length;

    const snapshot: SavedInventorySnapshot = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim() || `Inventario - ${dateStr}`,
      date: dateStr,
      itemCount: countBeforeSave,
      assignedCount: asignados,
      availableCount: disponibles,
      maintenanceCount: mantenimiento,
      items: items.map(i => ({ ...i })),
      notes: notes?.trim() || undefined,
    };

    // 1. Archive in Main Menu
    setSavedInventories(prev => [snapshot, ...prev]);
    setLastSavedTime(dateStr);

    // 2. Automatically clear active inventory table
    setItems([]);

    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_LAST_SAVED, dateStr);
    } catch {
      // ignore
    }

    // 3. Switch to saved view so the user sees their archived inventory in the main menu
    setCurrentView('saved');

    showToast(
      `¡Inventario "${snapshot.name}" guardado en el Menú Principal! Se ha limpiado la tabla activa (${countBeforeSave} equipos archivados) para un nuevo inventario.`,
      'success'
    );
  };

  // Load a saved inventory snapshot into the active workspace
  const handleLoadSavedInventory = (snapshot: SavedInventorySnapshot) => {
    const sanitizedItems = snapshot.items.map(sanitizeItem);
    setItems(sanitizedItems);
    setLastSavedTime(snapshot.date);
    setCurrentView('inventory');
    showToast(`Inventario "${snapshot.name}" cargado en la tabla activa (${sanitizedItems.length} equipos).`, 'success');
  };

  // Delete a saved inventory from the menu
  const handleDeleteSavedInventory = (id: string) => {
    setSavedInventories(prev => prev.filter(inv => inv.id !== id));
    showToast('Inventario guardado eliminado del menú principal.', 'info');
  };

  // Helper to create a test duplicate for demonstration
  const handleCreateTestDuplicate = () => {
    if (items.length === 0) return;
    const target = items[0];
    const duplicateItem: InventoryItem = {
      ...target,
      id: `dup-${Date.now()}`,
      usuario: 'Usuario Duplicado (Prueba)',
      ubicacion: 'Oficina 101 - Prueba',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems(prev => [duplicateItem, ...prev]);
    showToast(`Se ha creado un equipo duplicado con la misma Placa (${target.placa}) para probar el detector.`, 'info');
  };

  // Download template
  const handleDownloadTemplate = () => {
    const sampleCsv = getSampleCsvTemplate(';');
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_equipos_excel.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Plantilla CSV de Equipos para Excel descargada.', 'info');
  };

  // Reset sample data confirmation handler
  const handleExecuteResetData = () => {
    const sanitized = INITIAL_INVENTORY.map(sanitizeItem);
    setItems(sanitized);
    setMovements(INITIAL_MOVEMENTS);
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(sanitized));
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    showToast('Datos de equipos de prueba restaurados.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Navbar adhering to Top Bar contract */}
      <Navbar
        onOpenImport={() => setIsImportOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenMovements={() => setIsMovementsOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onDownloadTemplate={handleDownloadTemplate}
        onResetSampleData={() => setIsResetConfirmOpen(true)}
        itemCount={items.length}
        savedCount={savedInventories.length}
        currentView={currentView}
        onSelectView={setCurrentView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Main Menu View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'inventory'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Inventario Activo</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                currentView === 'inventory' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {items.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('saved')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'saved'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <FolderArchive className="w-4 h-4 text-emerald-500" />
              <span>Inventarios Guardados</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                savedInventories.length > 0 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {savedInventories.length}
              </span>
            </button>
          </div>

          {currentView === 'saved' && (
            <button
              onClick={() => setCurrentView('inventory')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer hidden sm:flex items-center gap-1"
            >
              <span>Volver a Inventario Activo</span>
              <span>&rarr;</span>
            </button>
          )}
        </div>

        {currentView === 'saved' ? (
          <SavedInventoriesList
            savedInventories={savedInventories}
            onLoadInventory={handleLoadSavedInventory}
            onDeleteSavedInventory={handleDeleteSavedInventory}
            onGoToActiveInventory={() => setCurrentView('inventory')}
          />
        ) : (
          <>
        
        {/* Workspace Title & Quick Actions */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Inventario de Equipos y Activos TI
              </h1>
              {lastSavedTime && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>Guardado: {lastSavedTime}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>Gestión de Hardware Corporativo</span>
              <span aria-hidden="true">·</span>
              <span>Sincronización CSV para Microsoft Excel</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{items.length} equipos en inventario</span>
            </div>
          </div>

          {/* Action buttons including Guardar and Borrar Inventario */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Guardar Inventario */}
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Guardar y finalizar el inventario actual"
            >
              <Save className="w-4 h-4 text-emerald-700" />
              <span>Guardar Inventario</span>
            </button>

            {/* Borrar Todo el Inventario */}
            <button
              onClick={() => setIsClearAllConfirmOpen(true)}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
              title="Borrar todos los equipos para empezar un inventario desde cero"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Borrar Inventario</span>
            </button>

            {duplicateAnalysis.totalDuplicateItems > 0 && (
              <button
                type="button"
                onClick={() => setIsDuplicatesModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="Auditar y ver equipos repetidos por Placa, Serie o Nombre"
              >
                <Copy className="w-4 h-4 text-amber-600" />
                <span>Ver Repetidos ({duplicateAnalysis.totalDuplicateItems})</span>
              </button>
            )}

            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Importar CSV</span>
            </button>

            <button
              onClick={() => {
                setItemToEdit(null);
                setIsItemModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-200" />
              <span>Registrar Equipo</span>
            </button>
          </div>
        </div>

        {/* Dashboard Metrics Strip */}
        <StatsCards
          items={items}
          activeFilter={filterStatus}
          onFilterChange={setFilterStatus}
          duplicateCount={duplicateAnalysis.totalDuplicateItems}
          onShowDuplicates={() => setIsDuplicatesModalOpen(true)}
        />

        {/* Main Equipment Table with the 13 columns + Acciones */}
        <InventoryTable
          items={items}
          onAddNewItem={() => {
            setItemToEdit(null);
            setIsItemModalOpen(true);
          }}
          onEditItem={(item) => {
            setItemToEdit(item);
            setIsItemModalOpen(true);
          }}
          onQuickStatusChange={(item) => setItemToAssign(item)}
          onDeleteItem={handleDeleteItem}
          onDeleteMultiple={handleDeleteMultiple}
          onOpenImportModal={() => setIsImportOpen(true)}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          onOpenDuplicatesModal={() => setIsDuplicatesModalOpen(true)}
        />

        {/* Contextual feature notes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-slate-900">Lectura Limpia de Caracteres en Español</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Decodificación inteligente compatible con Windows-1252 (ANSI) y UTF-8 con BOM. Muestra correctamente la letra <strong>Ñ</strong>, tildes (á, é, í, ó, ú) y símbolos sin deformaciones.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-slate-900">Guardado y Vaciado Seguro</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Puedes finalizar y asegurar tu inventario en cualquier momento o vaciarlo para iniciar una nueva auditoría sin perder tus copias de seguridad de Excel.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-slate-900">Trazabilidad de Custodia</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Historial de movimientos para auditorías: registra cada traspaso de custodio, ingreso a almacén de reserva o paso por taller de soporte técnico.
            </p>
          </div>
        </div>
        </>
      )}
      </main>

      {/* Modals */}
      <DuplicatesModal
        isOpen={isDuplicatesModalOpen}
        onClose={() => setIsDuplicatesModalOpen(false)}
        items={items}
        onEditItem={(item) => {
          setItemToEdit(item);
          setIsItemModalOpen(true);
        }}
        onDeleteItem={handleDeleteItem}
        onViewInTable={() => {
          setFilterStatus('duplicates');
          setCurrentView('inventory');
        }}
        onCreateTestDuplicate={handleCreateTestDuplicate}
      />

      <SaveInventoryModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        items={items}
        onConfirmSaveToMainMenu={handleConfirmSaveToMainMenu}
        lastSavedTime={lastSavedTime}
      />

      <CsvImportWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportSuccess}
        existingItems={items}
      />

      <CsvExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        allItems={items}
        filteredItems={items}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
        existingCategories={Array.from(new Set(items.map(i => i.categoria).filter(Boolean)))}
        existingDepartments={Array.from(new Set(items.map(i => i.departamento).filter(Boolean)))}
      />

      <StatusAssignModal
        isOpen={!!itemToAssign}
        onClose={() => setItemToAssign(null)}
        item={itemToAssign}
        onConfirmChange={handleConfirmStatusChange}
      />

      <MovementsLogModal
        isOpen={isMovementsOpen}
        onClose={() => setIsMovementsOpen(false)}
        movements={movements}
        onClearMovements={() => setIsClearMovementsConfirmOpen(true)}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        items={items}
        onQuickStatusChange={(item) => setItemToAssign(item)}
        onOpenEditItem={(item) => {
          setItemToEdit(item);
          setIsItemModalOpen(true);
        }}
      />

      {/* In-app Confirmation Modal for Clearing ENTIRE Inventory */}
      <ConfirmModal
        isOpen={isClearAllConfirmOpen}
        onClose={() => setIsClearAllConfirmOpen(false)}
        onConfirm={handleClearAllInventory}
        title="¿Deseas vaciar y borrar todo el inventario?"
        description={
          <div className="space-y-2">
            <p>
              Esta acción eliminará todos los <strong>{items.length} equipos</strong> actualmente registrados para que puedas comenzar un inventario completamente nuevo.
            </p>
            <p className="text-slate-500">
              Tip: Puedes pulsar en <em>&quot;Exportar&quot;</em> o <em>&quot;Guardar Inventario&quot;</em> previamente si deseas conservar una copia en Excel.
            </p>
          </div>
        }
        confirmText="Sí, Borrar Todo el Inventario"
        isDestructive={true}
      />

      {/* In-app Confirmation Modal for Resetting Demo Data */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleExecuteResetData}
        title="¿Restaurar catálogo de prueba?"
        description="Esta acción reemplazará los equipos actuales por el catálogo demo de hardware y restablecerá el historial de asignaciones."
        confirmText="Restaurar Datos"
        isDestructive={false}
      />

      {/* In-app Confirmation Modal for Clearing Movements */}
      <ConfirmModal
        isOpen={isClearMovementsConfirmOpen}
        onClose={() => setIsClearMovementsConfirmOpen(false)}
        onConfirm={() => {
          setMovements([]);
          showToast('Historial de movimientos vaciado.', 'info');
        }}
        title="¿Vaciar el historial de eventos?"
        description="Se eliminarán todos los registros de auditoría de custodia. Esta acción no se puede deshacer."
        confirmText="Vaciar Historial"
        isDestructive={true}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 transition-all transform ease-out duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium ${
            toast.type === 'success' 
              ? 'bg-slate-900 text-white border-slate-800' 
              : toast.type === 'warning'
              ? 'bg-amber-900 text-white border-amber-800'
              : 'bg-slate-800 text-white border-slate-700'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
