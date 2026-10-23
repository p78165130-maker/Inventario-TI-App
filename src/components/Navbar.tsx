import React from 'react';
import { Laptop, Upload, Download, ScanLine, History, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenImport: () => void;
  onOpenExport: () => void;
  onOpenMovements: () => void;
  onOpenScanner: () => void;
  onDownloadTemplate: () => void;
  onResetSampleData: () => void;
  itemCount: number;
  savedCount: number;
  currentView: 'inventory' | 'saved';
  onSelectView: (view: 'inventory' | 'saved') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenImport,
  onOpenExport,
  onOpenMovements,
  onOpenScanner,
  onDownloadTemplate,
  onResetSampleData,
  itemCount,
  savedCount,
  currentView,
  onSelectView,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Laptop className="w-4 h-4 text-slate-100" />
            </div>
            <a href="#" className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              InventarioPro <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">TI & Equipos</span>
            </a>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectView('inventory')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'inventory'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-950 text-slate-600'
              }`}
            >
              <Laptop className="w-4 h-4 text-slate-500" />
              <span>Inventario Activo</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700 font-mono font-bold">
                {itemCount}
              </span>
            </button>

            <button
              onClick={() => onSelectView('saved')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'saved'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-950 text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Inventarios Guardados</span>
              {savedCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <span className="h-4 w-px bg-slate-200" aria-hidden="true" />

            <button
              onClick={onOpenMovements}
              className="flex items-center gap-1.5 hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-xs"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Historial Custodia</span>
            </button>

            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-xs"
            >
              <ScanLine className="w-3.5 h-3.5 text-slate-400" />
              <span>Escanear Placa</span>
            </button>

            <button
              onClick={onDownloadTemplate}
              className="flex items-center gap-1.5 hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-xs"
              title="Descargar plantilla de Excel (.csv) con las columnas requeridas"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Plantilla Excel</span>
            </button>

            <button
              onClick={onResetSampleData}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-xs"
              title="Cargar equipos de prueba"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Datos Demo</span>
            </button>
          </nav>

          {/* Zone 3: Actions + Avatar */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenExport}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Exportar inventario a formato CSV compatible con Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>

            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              title="Importar archivo CSV exportado desde Excel"
            >
              <Upload className="w-3.5 h-3.5 text-slate-200" />
              <span>Importar CSV</span>
            </button>

            {/* IT Logistics Manager profile */}
            <div className="flex items-center pl-1 border-l border-slate-200">
              <img
                src="/src/assets/images/avatar_warehouse_manager_1792520190854.jpg"
                alt="Administrador de Activos TI"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
