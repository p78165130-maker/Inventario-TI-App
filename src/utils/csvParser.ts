import { CsvColumnMapping, InventoryItem, EquipmentStatus } from '../types/inventory';

/**
 * Reconstructs Spanish words when characters have been corrupted into Unicode
 * replacement characters ( / \uFFFD) by previous incorrect UTF-8 decodings of Windows-1252 Excel files.
 */
export function repairSpanishReplacementChars(text: string): string {
  if (!text || !text.includes('\uFFFD')) return text;

  let s = text;

  // 1. Specific corporate IT & common inventory vocabulary
  s = s
    .replace(/Diseo/g, 'Diseño')
    .replace(/diseo/g, 'diseño')
    .replace(/Pea/g, 'Peña')
    .replace(/pea/g, 'peña')
    .replace(/Muoz/g, 'Muñoz')
    .replace(/muoz/g, 'muñoz')
    .replace(/Ao/g, 'Año')
    .replace(/ao/g, 'año')
    .replace(/aos/g, 'años')
    .replace(/Castao/g, 'Castaño')
    .replace(/castao/g, 'castaño')
    .replace(/Almacn/g, 'Almacén')
    .replace(/almacn/g, 'almacén')
    .replace(/Tecnologa/g, 'Tecnología')
    .replace(/tecnologa/g, 'tecnología')
    .replace(/Categora/g, 'Categoría')
    .replace(/categora/g, 'categoría')
    .replace(/categra/g, 'categoría')
    .replace(/categria/g, 'categoría')
    .replace(/categora/g, 'categoría')
    .replace(/Garanta/g, 'Garantía')
    .replace(/garanta/g, 'garantía')
    .replace(/Telefona/g, 'Telefonía')
    .replace(/telefona/g, 'telefonía')
    .replace(/Informtica/g, 'Informática')
    .replace(/informtica/g, 'informática')
    .replace(/Logstica/g, 'Logística')
    .replace(/logstica/g, 'logística')
    .replace(/Cdigo/g, 'Código')
    .replace(/cdigo/g, 'código')
    .replace(/Nmero/g, 'Número')
    .replace(/nmero/g, 'número')
    .replace(/N/g, 'No.')
    .replace(/N\./g, 'No.')
    .replace(/No/g, 'No.')
    .replace(/Padrn/g, 'Padrón')
    .replace(/padrn/g, 'padrón')
    .replace(/Porttil/g, 'Portátil')
    .replace(/porttil/g, 'portátil')
    .replace(/Mvil/g, 'Móvil')
    .replace(/mvil/g, 'móvil')
    .replace(/Automtico/g, 'Automático')
    .replace(/automtico/g, 'automático')
    .replace(/Elctrico/g, 'Eléctrico')
    .replace(/elctrico/g, 'eléctrico')
    .replace(/Electrnico/g, 'Electrónico')
    .replace(/electrnico/g, 'electrónico')
    .replace(/Perifrico/g, 'Periférico')
    .replace(/perifrico/g, 'periférico')
    .replace(/Inalmbrico/g, 'Inalámbrico')
    .replace(/inalmbrico/g, 'inalámbrico')
    .replace(/Fsico/g, 'Físico')
    .replace(/fsico/g, 'físico')
    .replace(/Lnea/g, 'Línea')
    .replace(/lnea/g, 'línea')
    .replace(/Estacin/g, 'Estación')
    .replace(/estacin/g, 'estación')
    .replace(/Recepcin/g, 'Recepción')
    .replace(/recepcin/g, 'recepción')
    .replace(/Direccin/g, 'Dirección')
    .replace(/direccin/g, 'dirección')
    .replace(/Ubicacin/g, 'Ubicación')
    .replace(/ubicacin/g, 'ubicación')
    .replace(/Versin/g, 'Versión')
    .replace(/versin/g, 'versión')
    .replace(/Administracin/g, 'Administración')
    .replace(/administracin/g, 'administración')
    .replace(/Operacin/g, 'Operación')
    .replace(/operacin/g, 'operación')
    .replace(/Produccin/g, 'Producción')
    .replace(/produccin/g, 'producción')
    .replace(/Atencin/g, 'Atención')
    .replace(/atencin/g, 'atención')
    .replace(/Devolucin/g, 'Devolución')
    .replace(/devolucin/g, 'devolución')
    .replace(/Gestin/g, 'Gestión')
    .replace(/gestin/g, 'gestión')
    .replace(/Informacin/g, 'Información')
    .replace(/informacin/g, 'información')
    .replace(/Supervisin/g, 'Supervisión')
    .replace(/supervisin/g, 'supervisión')
    .replace(/Revisin/g, 'Revisión')
    .replace(/revisin/g, 'revisión')
    .replace(/Emisin/g, 'Emisión')
    .replace(/emisin/g, 'emisión');

  // 2. Common Spanish Surnames and proper names
  s = s
    .replace(/Garca/g, 'García')
    .replace(/garca/g, 'garcía')
    .replace(/Martnez/g, 'Martínez')
    .replace(/martnez/g, 'martínez')
    .replace(/Lpez/g, 'López')
    .replace(/lpez/g, 'lópez')
    .replace(/Prez/g, 'Pérez')
    .replace(/prez/g, 'pérez')
    .replace(/Gonzlez/g, 'González')
    .replace(/gonzlez/g, 'gonzález')
    .replace(/Snchez/g, 'Sánchez')
    .replace(/snchez/g, 'sánchez')
    .replace(/snchez/g, 'sánchez')
    .replace(/Rodrguez/g, 'Rodríguez')
    .replace(/rodrguez/g, 'rodríguez')
    .replace(/Hernndez/g, 'Hernández')
    .replace(/hernndez/g, 'hernández')
    .replace(/Daz/g, 'Díaz')
    .replace(/daz/g, 'díaz')
    .replace(/Ramrez/g, 'Ramírez')
    .replace(/ramrez/g, 'ramírez')
    .replace(/Gutirrez/g, 'Gutiérrez')
    .replace(/gutirrez/g, 'gutiérrez')
    .replace(/Mndez/g, 'Méndez')
    .replace(/mndez/g, 'méndez')
    .replace(/Surez/g, 'Suárez')
    .replace(/surez/g, 'suárez')
    .replace(/Vsquez/g, 'Vásquez')
    .replace(/vsquez/g, 'vásquez')
    .replace(/Jimnez/g, 'Jiménez')
    .replace(/jimnez/g, 'jiménez')
    .replace(/Bermdez/g, 'Bermúdez')
    .replace(/Nez/g, 'Núñez')
    .replace(/Nez/g, 'Núñez')
    .replace(/Ibez/g, 'Ibáñez')
    .replace(/Ibez/g, 'Ibáñez')
    .replace(/Mara/g, 'María')
    .replace(/mara/g, 'maría')
    .replace(/Jess/g, 'Jesús')
    .replace(/jess/g, 'jesús')
    .replace(/Sebastin/g, 'Sebastián')
    .replace(/sebastin/g, 'sebastián')
    .replace(/Andrs/g, 'Andrés')
    .replace(/andrs/g, 'andrés')
    .replace(/Julin/g, 'Julián')
    .replace(/julin/g, 'julián')
    .replace(/Rubn/g, 'Rubén')
    .replace(/rubn/g, 'rubén')
    .replace(/Guzmn/g, 'Guzmán')
    .replace(/Germn/g, 'Germán')
    .replace(/Romn/g, 'Román');

  // 3. Regular suffix patterns for Spanish words ending with -cin or -sin
  s = s.replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)cin\b/g, '$1ción');
  s = s.replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)sin\b/g, '$1sión');
  s = s.replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)ga\b/g, '$1gía');
  s = s.replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)ta\b/g, '$1tía');

  // 4. Any leftover replacement character:
  // If followed by 'n' and at word boundary -> 'ó' (e.g. camin -> camión)
  s = s.replace(/n\b/g, 'ón');
  // If preceded by 'N' -> '.' (e.g. N -> No.)
  s = s.replace(/N/g, 'No.');
  // If between vowels/consonants typical for 'ñ' (e.g. ao, eo, uo, aa)
  s = s.replace(/([aeiouAEIOU])([aeiouAEIOU])/g, '$1ñ$2');

  // Finally remove any stray replacement character so it never renders as 
  s = s.replace(/\uFFFD/g, '');

  return s;
}

/**
 * Repairs common Spanish Mojibake characters that occur when Windows-1252 / ANSI
 * or double-encoded UTF-8 files from Excel are loaded (e.g. Ã± -> ñ, Ã‘ -> Ñ).
 */
export function fixMojibake(text: string): string {
  if (!text) return text;
  let s = text
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ãœ/g, 'Ü')
    .replace(/Â¿/g, '¿')
    .replace(/Â¡/g, '¡')
    .replace(/Âº/g, 'º')
    .replace(/Âª/g, 'ª')
    .replace(/â€“/g, '–')
    .replace(/â€”/g, '—')
    .replace(/â€œ/g, '“')
    .replace(/â€/g, '”')
    .replace(/â€˜/g, '‘')
    .replace(/â€™/g, '’')
    .replace(/â€¢/g, '•');

  return repairSpanishReplacementChars(s);
}

/**
 * Analyzes raw bytes of a CSV file to detect whether it is UTF-8 or Windows-1252 (Excel ANSI).
 */
export function detectEncodingFromBytes(uint8: Uint8Array): 'utf-8' | 'windows-1252' {
  // 1. If it has UTF-8 BOM, it is definitely UTF-8
  if (uint8.length >= 3 && uint8[0] === 0xEF && uint8[1] === 0xBB && uint8[2] === 0xBF) {
    return 'utf-8';
  }

  // 2. Count UTF-8 multi-byte sequences vs isolated Windows-1252 Spanish high bytes
  let validUtf8MultiBytes = 0;
  let invalidUtf8Sequences = 0;
  let typicalWindows1252SpanishBytes = 0;

  for (let i = 0; i < uint8.length; i++) {
    const byte = uint8[i];
    if (byte <= 0x7F) {
      continue;
    }

    // Typical Spanish single-byte characters in Windows-1252:
    // 0xF1 = ñ, 0xD1 = Ñ, 0xE1 = á, 0xE9 = é, 0xED = í, 0xF3 = ó, 0xFA = ú
    // 0xC1 = Á, 0xC9 = É, 0xCD = Í, 0xD3 = Ó, 0xDA = Ú, 0xFC = ü, 0xDC = Ü
    // 0xBA = º, 0xAA = ª, 0xBF = ¿, 0xA1 = ¡
    const isSpanishWinByte = (
      byte === 0xF1 || byte === 0xD1 || byte === 0xE1 || byte === 0xE9 ||
      byte === 0xED || byte === 0xF3 || byte === 0xFA || byte === 0xC1 ||
      byte === 0xC9 || byte === 0xCD || byte === 0xD3 || byte === 0xDA ||
      byte === 0xFC || byte === 0xDC || byte === 0xBA || byte === 0xAA ||
      byte === 0xBF || byte === 0xA1
    );

    // Check if it forms a valid 2-byte UTF-8 sequence (e.g. 0xC3 followed by 0x80-0xBF)
    if (byte >= 0xC2 && byte <= 0xDF && i + 1 < uint8.length) {
      const next = uint8[i + 1];
      if (next >= 0x80 && next <= 0xBF) {
        validUtf8MultiBytes++;
        i++;
        continue;
      }
    } else if (byte >= 0xE0 && byte <= 0xEF && i + 2 < uint8.length) {
      // 3-byte UTF-8
      const next1 = uint8[i + 1];
      const next2 = uint8[i + 2];
      if (next1 >= 0x80 && next1 <= 0xBF && next2 >= 0x80 && next2 <= 0xBF) {
        validUtf8MultiBytes++;
        i += 2;
        continue;
      }
    }

    // Invalid UTF-8 sequence
    invalidUtf8Sequences++;
    if (isSpanishWinByte) {
      typicalWindows1252SpanishBytes++;
    }
  }

  // If there are invalid UTF-8 sequences and we saw Windows-1252 Spanish bytes, or more invalid than valid:
  if (invalidUtf8Sequences > 0 && typicalWindows1252SpanishBytes > 0) {
    return 'windows-1252';
  }

  if (invalidUtf8Sequences > validUtf8MultiBytes) {
    return 'windows-1252';
  }

  return 'utf-8';
}

/**
 * Intelligently decodes an ArrayBuffer from a CSV file.
 * Handles UTF-8 BOM, standard UTF-8, and Windows-1252 / ISO-8859-1 (classic Excel default in Spanish).
 */
export function decodeCsvBuffer(buffer: ArrayBuffer, encodingOverride?: string): string {
  const uint8 = new Uint8Array(buffer);

  // If user selected explicit encoding:
  if (encodingOverride && encodingOverride !== 'auto') {
    try {
      const decoder = new TextDecoder(encodingOverride);
      return fixMojibake(decoder.decode(buffer));
    } catch {
      // Fallback
    }
  }

  // 1. Check for UTF-8 BOM (EF BB BF)
  if (uint8.length >= 3 && uint8[0] === 0xEF && uint8[1] === 0xBB && uint8[2] === 0xBF) {
    const decoder = new TextDecoder('utf-8');
    return fixMojibake(decoder.decode(buffer));
  }

  // 2. Detect encoding from raw bytes
  const detected = detectEncodingFromBytes(uint8);

  if (detected === 'windows-1252') {
    try {
      const winDecoder = new TextDecoder('windows-1252');
      const text = winDecoder.decode(buffer);
      return fixMojibake(text);
    } catch {
      // fallback to iso-8859-1
      try {
        const latin1Decoder = new TextDecoder('iso-8859-1');
        return fixMojibake(latin1Decoder.decode(buffer));
      } catch {
        // continue to utf8
      }
    }
  }

  // 3. Try UTF-8 decoding
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
    const decoded = utf8Decoder.decode(buffer);
    // If it produced replacement characters, it was actually Windows-1252!
    if (decoded.includes('\uFFFD')) {
      try {
        const winDecoder = new TextDecoder('windows-1252');
        return fixMojibake(winDecoder.decode(buffer));
      } catch {
        // fallback
      }
    }
    return fixMojibake(decoded);
  } catch {
    // 4. Fallback to Windows-1252
    try {
      const winDecoder = new TextDecoder('windows-1252');
      return fixMojibake(winDecoder.decode(buffer));
    } catch {
      const latin1Decoder = new TextDecoder('iso-8859-1');
      return fixMojibake(latin1Decoder.decode(buffer));
    }
  }
}

/**
 * Detects the delimiter used in a CSV string.
 * Excel in Spanish/European regions defaults to semicolon (;).
 * Standard CSV uses comma (,). Tab (\t) is also supported.
 */
export function detectDelimiter(text: string): string {
  const clean = text.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0).slice(0, 10);
  
  if (lines.length === 0) return ';';

  const delimiters = [';', ',', '\t', '|'];
  const counts: Record<string, number> = { ';': 0, ',': 0, '\t': 0, '|': 0 };

  for (const line of lines) {
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (!inQuote && delimiters.includes(char)) {
        counts[char]++;
      }
    }
  }

  let bestDelimiter = ';';
  let maxCount = -1;
  for (const delim of delimiters) {
    if (counts[delim] > maxCount) {
      maxCount = counts[delim];
      bestDelimiter = delim;
    }
  }

  return maxCount > 0 ? bestDelimiter : ';';
}

/**
 * RFC 4180 compliant CSV line tokenizer that respects quotes and escaped quotes ("").
 */
export function tokenizeCsv(csvText: string, delimiter: string = ';'): string[][] {
  const clean = fixMojibake(csvText.replace(/^\uFEFF/, ''));
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(fixMojibake(currentField.trim()));
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(fixMojibake(currentField.trim()));
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(fixMojibake(currentField.trim()));
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Auto-detect matching CSV headers to IT equipment inventory fields.
 */
export function autoMapColumns(headers: string[]): CsvColumnMapping {
  const normalize = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

  const normalizedHeaders = headers.map(h => ({ raw: h, clean: normalize(h) }));

  const findHeader = (keywords: string[]): string => {
    // 1. Exact match
    for (const kw of keywords) {
      const cleanKw = normalize(kw);
      const match = normalizedHeaders.find(h => h.clean === cleanKw);
      if (match) return match.raw;
    }
    // 2. Starts with or includes
    for (const kw of keywords) {
      const cleanKw = normalize(kw);
      const match = normalizedHeaders.find(h => h.clean.includes(cleanKw) || cleanKw.includes(h.clean));
      if (match) return match.raw;
    }
    return '';
  };

  return {
    placa: findHeader(['placa', 'placa_inventario', 'tag', 'asset_tag', 'codigo', 'id', 'cod_inventario', 'activo_fijo', 'placan', 'numero_placa']),
    nombreEquipo: findHeader(['nombre de equipo', 'nombre_equipo', 'nombre equipo', 'equipo', 'hostname', 'host', 'computer_name', 'device_name', 'nombre']),
    usuario: findHeader(['usuario', 'user', 'responsable', 'asignado_a', 'asignado', 'custodio', 'empleado', 'propietario']),
    fabricante: findHeader(['fabricante', 'marca', 'vendor', 'manufacturer', 'brand', 'fabric']),
    modelo: findHeader(['modelo', 'model', 'referencia_modelo']),
    noSerie: findHeader(['no. serie', 'no_serie', 'no serie', 'serie', 'serial', 's/n', 'sn', 'service_tag', 'serial_number', 'no']),
    direccionIp: findHeader(['direccion ip', 'dirección ip', 'direccion_ip', 'ip', 'ip_address', 'ipv4', 'red_ip']),
    versionSo: findHeader(['version s.o.', 'versión s.o.', 'version_so', 'version so', 'so', 'os', 'sistema_operativo', 'sistema']),
    ram: findHeader(['ram', 'memoria', 'memoria_ram', 'memory', 'capacidad_ram']),
    disco: findHeader(['disco', 'almacenamiento', 'disco_duro', 'storage', 'ssd', 'hdd', 'unidad_disco']),
    categoria: findHeader(['categoria', 'categoría', 'category', 'tipo_equipo', 'tipo', 'clase']),
    departamento: findHeader(['departamento', 'depto', 'area', 'área', 'department', 'seccion', 'unidad']),
    ubicacion: findHeader(['ubicacion', 'ubicación', 'sede', 'piso', 'oficina', 'location', 'sitio', 'lugar']),
    estado: findHeader(['estado', 'status', 'condicion', 'situacion']),
    notas: findHeader(['notas', 'observaciones', 'comentarios', 'detalles', 'notes']),
  };
}

/**
 * Escapes value for CSV.
 */
function escapeCsvValue(value: string, delimiter: string): string {
  if (value.includes(delimiter) || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Exports equipment to a CSV string with the exact requested columns formatted for Excel.
 * Placa;Nombre de Equipo;Usuario;Fabricante;Modelo;No. Serie;Dirección IP;Versión S.O.;RAM;Disco;Categoría;Departamento;Ubicación
 */
export function exportToCsv(
  items: InventoryItem[],
  options: {
    delimiter?: string;
    includeBom?: boolean;
  } = {}
): string {
  const delimiter = options.delimiter || ';';
  const includeBom = options.includeBom !== false;

  const columns: Array<{ key: keyof InventoryItem; label: string }> = [
    { key: 'placa', label: 'Placa' },
    { key: 'nombreEquipo', label: 'Nombre de Equipo' },
    { key: 'usuario', label: 'Usuario' },
    { key: 'fabricante', label: 'Fabricante' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'noSerie', label: 'No. Serie' },
    { key: 'direccionIp', label: 'Dirección IP' },
    { key: 'versionSo', label: 'Versión S.O.' },
    { key: 'ram', label: 'RAM' },
    { key: 'disco', label: 'Disco' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'departamento', label: 'Departamento' },
    { key: 'ubicacion', label: 'Ubicación' },
  ];

  const headerRow = columns.map(c => escapeCsvValue(c.label, delimiter)).join(delimiter);

  const dataRows = items.map(item => {
    return columns.map(col => {
      const val = item[col.key];
      if (val === undefined || val === null) return '';
      return escapeCsvValue(fixMojibake(String(val)), delimiter);
    }).join(delimiter);
  });

  const csvContent = [headerRow, ...dataRows].join('\r\n');
  return includeBom ? '\uFEFF' + csvContent : csvContent;
}

/**
 * Creates downloadable template CSV file with the requested columns for Excel.
 */
export function getSampleCsvTemplate(delimiter: string = ';'): string {
  const sampleItems: Partial<InventoryItem>[] = [
    {
      placa: 'TI-00124',
      nombreEquipo: 'CORP-LAP-104',
      usuario: 'Ana Lucía Morales',
      fabricante: 'Dell',
      modelo: 'Latitude 5430',
      noSerie: '8GK3M42',
      direccionIp: '192.168.10.45',
      versionSo: 'Windows 11 Pro 23H2',
      ram: '16 GB DDR4',
      disco: '512 GB NVMe SSD',
      categoria: 'Laptop',
      departamento: 'Finanzas',
      ubicacion: 'Piso 3 · Oficina 304'
    },
    {
      placa: 'TI-00125',
      nombreEquipo: 'CORP-LAP-105',
      usuario: 'Carlos Eduardo Ramos',
      fabricante: 'Lenovo',
      modelo: 'ThinkPad T14 Gen 4',
      noSerie: 'PF3X89LK',
      direccionIp: '192.168.10.78',
      versionSo: 'Windows 11 Pro 23H2',
      ram: '32 GB DDR5',
      disco: '1 TB NVMe SSD',
      categoria: 'Laptop',
      departamento: 'Tecnología',
      ubicacion: 'Piso 4 · Oficina 401'
    },
    {
      placa: 'TI-00126',
      nombreEquipo: 'CORP-DESK-012',
      usuario: 'Elena Gómez Castro',
      fabricante: 'HP',
      modelo: 'EliteDesk 800 G8',
      noSerie: 'MXL145902B',
      direccionIp: '192.168.20.12',
      versionSo: 'Windows 10 Pro 22H2',
      ram: '16 GB DDR4',
      disco: '512 GB SSD + 1 TB HDD',
      categoria: 'Desktop',
      departamento: 'Recursos Humanos',
      ubicacion: 'Piso 2 · Recepción'
    },
    {
      placa: 'TI-00127',
      nombreEquipo: 'CORP-SRV-APP01',
      usuario: 'Administrador TI (Servicio)',
      fabricante: 'Dell',
      modelo: 'PowerEdge R650',
      noSerie: 'CN09X781',
      direccionIp: '192.168.1.10',
      versionSo: 'Ubuntu Server 22.04 LTS',
      ram: '128 GB ECC DDR4',
      disco: '4x 1.92 TB SAS SSD (RAID 10)',
      categoria: 'Servidor',
      departamento: 'Infraestructura TI',
      ubicacion: 'Data Center · Rack 02'
    },
    {
      placa: 'TI-00128',
      nombreEquipo: 'CORP-SW-CORE',
      usuario: 'Redes y Comunicaciones',
      fabricante: 'Cisco',
      modelo: 'Catalyst 9300-48P',
      noSerie: 'FDO2418B92',
      direccionIp: '192.168.1.2',
      versionSo: 'Cisco IOS-XE 17.9',
      ram: '16 GB',
      disco: '16 GB Flash',
      categoria: 'Switch de Red',
      departamento: 'Infraestructura TI',
      ubicacion: 'Data Center · Rack 01'
    },
    {
      placa: 'TI-00129',
      nombreEquipo: 'CORP-PRN-FIN01',
      usuario: 'Uso Compartido Finanzas',
      fabricante: 'Kyocera',
      modelo: 'ECOSYS M3655idn',
      noSerie: 'VGF9823104',
      direccionIp: '192.168.10.200',
      versionSo: 'Firmware v4.12',
      ram: '1 GB',
      disco: 'eMMC 8 GB',
      categoria: 'Impresora Multifuncional',
      departamento: 'Finanzas',
      ubicacion: 'Piso 3 · Pasillo Central'
    }
  ];

  return exportToCsv(sampleItems as InventoryItem[], { delimiter, includeBom: true });
}
