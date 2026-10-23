import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  Settings2, 
  Info,
  Type
} from 'lucide-react';
import { InventoryItem, CsvColumnMapping, DuplicateStrategy } from '../types/inventory';
import { 
  detectDelimiter, 
  tokenizeCsv, 
  autoMapColumns, 
  getSampleCsvTemplate,
  decodeCsvBuffer,
  fixMojibake
} from '../utils/csvParser';

interface CsvImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (items: InventoryItem[], strategy: DuplicateStrategy) => void;
  existingItems: InventoryItem[];
}

type WizardStep = 'upload' | 'mapping' | 'preview';

export const CsvImportWizard: React.FC<CsvImportWizardProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingItems,
}) => {
  const [step, setStep] = useState<WizardStep>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [rawBuffer, setRawBuffer] = useState<ArrayBuffer | null>(null);
  const [rawCsvText, setRawCsvText] = useState<string>('');
  const [selectedEncoding, setSelectedEncoding] = useState<string>('auto');
  const [detectedDelimiter, setDetectedDelimiter] = useState<string>(';');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<CsvColumnMapping>({
    placa: '',
    nombreEquipo: '',
    usuario: '',
    fabricante: '',
    modelo: '',
    noSerie: '',
    direccionIp: '',
    versionSo: '',
    ram: '',
    disco: '',
    categoria: '',
    departamento: '',
    ubicacion: '',
  });
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>('overwrite');
  const [isDragging, setIsDragging] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processDecodedText = (text: string, name: string = 'archivo.csv', customDelim?: string) => {
    setErrorMsg(null);
    const cleanedText = fixMojibake(text);

    if (!cleanedText || cleanedText.trim().length === 0) {
      setErrorMsg('El archivo o texto está vacío. Por favor selecciona un archivo con datos.');
      return;
    }

    try {
      const delim = customDelim || detectDelimiter(cleanedText);
      setDetectedDelimiter(delim);

      const tokenized = tokenizeCsv(cleanedText, delim);
      if (tokenized.length < 2) {
        setErrorMsg('El archivo debe tener al menos una fila de encabezados y una fila con datos.');
        return;
      }

      const fileHeaders = tokenized[0].map(h => fixMojibake(h.trim()));
      const dataRows = tokenized.slice(1).map(row => row.map(cell => fixMojibake(cell.trim())));

      setHeaders(fileHeaders);
      setRawRows(dataRows);
      setRawCsvText(cleanedText);
      setFileName(name);

      const autoMapped = autoMapColumns(fileHeaders);
      setMapping(autoMapped);

      setStep('mapping');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar';
      setErrorMsg(`No se pudo leer el archivo CSV: ${msg}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      setRawBuffer(buffer);
      const text = decodeCsvBuffer(buffer, selectedEncoding);
      processDecodedText(text, file.name);
    };
    reader.onerror = () => {
      setErrorMsg('Error al leer el archivo en el navegador.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        setRawBuffer(buffer);
        const text = decodeCsvBuffer(buffer, selectedEncoding);
        processDecodedText(text, file.name);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleEncodingChange = (newEnc: string) => {
    setSelectedEncoding(newEnc);
    if (rawBuffer) {
      const text = decodeCsvBuffer(rawBuffer, newEnc);
      processDecodedText(text, fileName, detectedDelimiter);
    }
  };

  const handleDelimiterChange = (newDelim: string) => {
    setDetectedDelimiter(newDelim);
    if (rawCsvText) {
      const tokenized = tokenizeCsv(rawCsvText, newDelim);
      if (tokenized.length > 0) {
        const newHeaders = tokenized[0].map(h => fixMojibake(h.trim()));
        setHeaders(newHeaders);
        setRawRows(tokenized.slice(1).map(r => r.map(c => fixMojibake(c.trim()))));
        setMapping(autoMapColumns(newHeaders));
      }
    }
  };

  // Convert raw rows using current mapping
  const buildParsedItems = (): InventoryItem[] => {
    const headerIndices: Record<string, number> = {};
    headers.forEach((h, idx) => {
      headerIndices[h] = idx;
    });

    const getVal = (row: string[], colHeader: string): string => {
      if (!colHeader) return '';
      const idx = headerIndices[colHeader];
      if (idx === undefined || idx < 0 || idx >= row.length) return '';
      return fixMojibake(row[idx]?.trim() || '');
    };

    const items: InventoryItem[] = [];
    const now = new Date().toISOString();

    rawRows.forEach((row, i) => {
      if (row.every(cell => !cell.trim())) return;

      const rawPlaca = getVal(row, mapping.placa);
      const rawNombre = getVal(row, mapping.nombreEquipo);
      const rawUsuario = getVal(row, mapping.usuario);

      const placa = rawPlaca ? rawPlaca.toUpperCase() : `PLACA-${String(i + 1).padStart(4, '0')}`;
      const nombreEquipo = rawNombre ? rawNombre.toUpperCase() : `EQUIPO-${placa}`;
      const usuario = rawUsuario || 'Disponible (Sin asignar)';
      const fabricante = getVal(row, mapping.fabricante) || 'Genérico';
      const modelo = getVal(row, mapping.modelo) || 'Sin modelo';
      const noSerie = getVal(row, mapping.noSerie) || 'S/N no especificado';
      const direccionIp = getVal(row, mapping.direccionIp) || 'DHCP';
      const versionSo = getVal(row, mapping.versionSo) || 'N/A';
      const ram = getVal(row, mapping.ram) || '8 GB';
      const disco = getVal(row, mapping.disco) || '256 GB';
      const categoria = getVal(row, mapping.categoria) || 'Laptop';
      const departamento = getVal(row, mapping.departamento) || 'General';
      const ubicacion = getVal(row, mapping.ubicacion) || 'Almacén TI';
      const notas = mapping.notas ? getVal(row, mapping.notas) : '';

      const estado = usuario.toLowerCase().includes('disponible') || usuario.toLowerCase().includes('almacen')
        ? 'available'
        : 'assigned';

      items.push({
        id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        placa,
        nombreEquipo,
        usuario,
        fabricante,
        modelo,
        noSerie,
        direccionIp,
        versionSo,
        ram,
        disco,
        categoria,
        departamento,
        ubicacion,
        estado,
        notas: notas || undefined,
        createdAt: now,
        updatedAt: now,
      });
    });

    return items;
  };

  const parsedItems = rawRows.length > 0 ? buildParsedItems() : [];

  const existingPlacaSet = new Set(existingItems.map(item => item.placa.trim().toLowerCase()));
  const duplicatesInSystem = parsedItems.filter(p => existingPlacaSet.has(p.placa.trim().toLowerCase())).length;

  const handleFinishImport = () => {
    onImportSuccess(parsedItems, duplicateStrategy);
    onClose();
  };

  const handleDownloadSample = () => {
    const sampleCsv = getSampleCsvTemplate(';');
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_equipos_excel.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadExampleDataDirectly = () => {
    const sample = getSampleCsvTemplate(';');
    processDecodedText(sample, 'equipos_ejemplo_excel.csv');
  };

  const requiredFields = [
    { key: 'placa', label: 'Placa (Asset Tag) *', required: true, desc: 'Identificador único físico' },
    { key: 'nombreEquipo', label: 'Nombre de Equipo *', required: true, desc: 'Hostname o nombre de red' },
    { key: 'usuario', label: 'Usuario', required: false, desc: 'Colaborador o custodio asignado' },
    { key: 'fabricante', label: 'Fabricante', required: false, desc: 'Marca (Dell, Lenovo, HP, etc.)' },
    { key: 'modelo', label: 'Modelo', required: false, desc: 'Modelo del equipo' },
    { key: 'noSerie', label: 'No. Serie', required: false, desc: 'Número de serie o Service Tag' },
    { key: 'direccionIp', label: 'Dirección IP', required: false, desc: 'IP asignada o DHCP' },
    { key: 'versionSo', label: 'Versión S.O.', required: false, desc: 'Sistema Operativo' },
    { key: 'ram', label: 'RAM', required: false, desc: 'Memoria instalada' },
    { key: 'disco', label: 'Disco', required: false, desc: 'Capacidad y tipo de almacenamiento' },
    { key: 'categoria', label: 'Categoría', required: false, desc: 'Laptop, Desktop, Servidor, etc.' },
    { key: 'departamento', label: 'Departamento', required: false, desc: 'Área responsable' },
    { key: 'ubicacion', label: 'Ubicación', required: false, desc: 'Sede, piso u oficina' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Importador de Equipos desde CSV de Excel
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Paso {step === 'upload' ? '1 de 3: Cargar Archivo' : step === 'mapping' ? '2 de 3: Mapeo de Columnas' : '3 de 3: Confirmación'}</span>
                {fileName && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-700">{fileName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Atención al procesar el archivo</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-6">
              {!pasteMode ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-50/50' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .txt, .tsv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="w-14 h-14 mx-auto rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 mb-4">
                    <Upload className="w-6 h-6" />
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    Arrastra tu archivo CSV de Excel aquí o selecciona uno
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-2">
                    Lee archivos con columnas: <strong>Placa, Nombre de Equipo, Usuario, Fabricante, Modelo, No. Serie, Dirección IP, Versión S.O., RAM, Disco, Categoría, Departamento, Ubicación</strong>.
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium mb-5">
                    ✓ Soporte automático para caracteres en español (letras Ñ, tildes y acentos sin símbolos raros).
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                    >
                      Buscar archivo en el equipo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasteMode(true)}
                      className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      O pegar celdas copiadas de Excel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Pega aquí las filas de Excel (Ctrl+V / Cmd+V):
                    </label>
                    <button
                      type="button"
                      onClick={() => setPasteMode(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Volver a subir archivo
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Placa;Nombre de Equipo;Usuario;Fabricante;Modelo;No. Serie;Dirección IP;Versión S.O.;RAM;Disco;Categoría;Departamento;Ubicación&#10;TI-001;CORP-LAP-01;Carlos Muñoz;Dell;Latitude 5430;8GK3M42;192.168.1.10;Windows 11;16 GB;512 GB;Laptop;Diseño;Piso 3"
                    className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => processDecodedText(pastedText, 'pegado_excel.csv')}
                      disabled={!pastedText.trim()}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Procesar texto copiado
                    </button>
                  </div>
                </div>
              )}

              {/* Helper strip */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">¿Deseas una plantilla prediseñada para Excel?</span>
                    <p className="mt-0.5">Descarga nuestra plantilla con los 13 campos exactos listos para rellenar, o carga los datos de prueba.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Descargar Plantilla (.csv)</span>
                  </button>
                  <button
                    type="button"
                    onClick={loadExampleDataDirectly}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Cargar Ejemplo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MAPPING */}
          {step === 'mapping' && (
            <div className="space-y-6">
              {/* Delimiter & Encoding Toolbar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Delimitador:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-900">
                    {detectedDelimiter === ';' ? 'Punto y coma (;)' : detectedDelimiter === ',' ? 'Coma (,)' : detectedDelimiter === '\t' ? 'Tabulación' : detectedDelimiter}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{headers.length} columnas</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{rawRows.length} filas</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Delimiter switch */}
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 text-[11px]">Separador:</span>
                    <button
                      type="button"
                      onClick={() => handleDelimiterChange(';')}
                      className={`px-2 py-1 rounded text-xs font-mono font-medium ${
                        detectedDelimiter === ';' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ; (Excel ES)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelimiterChange(',')}
                      className={`px-2 py-1 rounded text-xs font-mono font-medium ${
                        detectedDelimiter === ',' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      , (Coma)
                    </button>
                  </div>

                  {/* Encoding switch (Fixes Ñ / accents if user saved in Windows-1252 ANSI) */}
                  {rawBuffer && (
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                      <Type className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500 text-[11px]">Codificación:</span>
                      <select
                        value={selectedEncoding}
                        onChange={(e) => handleEncodingChange(e.target.value)}
                        className="text-xs bg-white border border-slate-200 rounded px-2 py-1 font-medium text-slate-700 cursor-pointer"
                        title="Si las letras Ñ o tildes se ven con símbolos extraños, cambia a Windows-1252 o UTF-8"
                      >
                        <option value="auto">Auto-detectada</option>
                        <option value="windows-1252">Windows-1252 (Excel ANSI)</option>
                        <option value="utf-8">UTF-8</option>
                        <option value="iso-8859-1">ISO-8859-1 (Latin1)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Column mapping grid */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Mapeo de Columnas para Equipos de Inventario
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hemos asociado automáticamente los encabezados de tu archivo. Revisa que correspondan a cada columna requerida.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {requiredFields.map(field => {
                    const currentVal = mapping[field.key as keyof CsvColumnMapping];
                    const sampleVal = currentVal ? rawRows[0]?.[headers.indexOf(currentVal)] : '';

                    return (
                      <div key={field.key} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-800 truncate">
                              {field.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{field.desc}</p>
                          {sampleVal && (
                            <p className="text-[11px] text-emerald-600 font-mono truncate mt-0.5">
                              Ejemplo: &quot;{sampleVal}&quot;
                            </p>
                          )}
                        </div>

                        <select
                          value={currentVal || ''}
                          onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className={`text-xs rounded-lg px-2.5 py-1.5 border font-medium cursor-pointer ${
                            currentVal 
                              ? 'border-slate-300 bg-slate-50 text-slate-900 focus:bg-white' 
                              : 'border-slate-200 bg-white text-slate-400'
                          }`}
                        >
                          <option value="">(No mapear / Vacío)</option>
                          {headers.map(h => (
                            <option key={h} value={h}>
                              Columna: {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  ← Cambiar archivo
                </button>
                <button
                  type="button"
                  onClick={() => setStep('preview')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Continuar a Vista Previa ({rawRows.length} equipos)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & DUPLICATE STRATEGY */}
          {step === 'preview' && (
            <div className="space-y-6">
              {/* Duplicates strategy selector */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-900">
                    Estrategia para equipos con la misma Placa:
                  </span>
                  {duplicatesInSystem > 0 && (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      {duplicatesInSystem} Placas ya existen en el sistema
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      duplicateStrategy === 'overwrite'
                        ? 'bg-white border-slate-900 ring-1 ring-slate-900'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dupStrategy"
                      checked={duplicateStrategy === 'overwrite'}
                      onChange={() => setDuplicateStrategy('overwrite')}
                      className="mt-0.5 text-slate-900 focus:ring-slate-900"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900 block">Sobrescribir / Actualizar</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Actualiza usuario, especificaciones y ubicación del equipo existente.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      duplicateStrategy === 'skip'
                        ? 'bg-white border-slate-900 ring-1 ring-slate-900'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dupStrategy"
                      checked={duplicateStrategy === 'skip'}
                      onChange={() => setDuplicateStrategy('skip')}
                      className="mt-0.5 text-slate-900 focus:ring-slate-900"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900 block">Omitir Duplicados</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Conserva los equipos actuales e importa únicamente las placas nuevas.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview table (first 5 rows) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800">
                    Vista previa de los primeros {Math.min(5, parsedItems.length)} equipos a incorporar:
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Total a registrar: {parsedItems.length} equipos
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Placa</th>
                        <th className="py-2.5 px-3">Equipo</th>
                        <th className="py-2.5 px-3">Usuario</th>
                        <th className="py-2.5 px-3">Fabricante</th>
                        <th className="py-2.5 px-3">Modelo</th>
                        <th className="py-2.5 px-3">No. Serie</th>
                        <th className="py-2.5 px-3">Dirección IP</th>
                        <th className="py-2.5 px-3">RAM</th>
                        <th className="py-2.5 px-3">Disco</th>
                        <th className="py-2.5 px-3">Departamento</th>
                        <th className="py-2.5 px-3">Ubicación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedItems.slice(0, 5).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{item.placa}</td>
                          <td className="py-2 px-3 font-mono font-medium text-slate-800">{item.nombreEquipo}</td>
                          <td className="py-2 px-3 text-slate-700">{item.usuario}</td>
                          <td className="py-2 px-3 text-slate-600">{item.fabricante}</td>
                          <td className="py-2 px-3 text-slate-600">{item.modelo}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{item.noSerie}</td>
                          <td className="py-2 px-3 font-mono text-slate-700">{item.direccionIp}</td>
                          <td className="py-2 px-3 font-mono text-slate-800">{item.ram}</td>
                          <td className="py-2 px-3 font-mono text-slate-700">{item.disco}</td>
                          <td className="py-2 px-3 text-slate-600">{item.departamento}</td>
                          <td className="py-2 px-3 text-slate-500">{item.ubicacion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom confirmation actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep('mapping')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  ← Volver al mapeo
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishImport}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmar e Importar {parsedItems.length} Equipos</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
