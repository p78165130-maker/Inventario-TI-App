import { InventoryItem } from '../types/inventory';

export type DuplicateType = 'placa' | 'noSerie' | 'nombreEquipo';

export interface DuplicateGroup {
  id: string;
  type: DuplicateType;
  typeLabel: string;
  fieldLabel: string;
  value: string;
  items: InventoryItem[];
}

export interface DuplicateInfo {
  isDuplicate: boolean;
  hasDuplicatePlaca: boolean;
  hasDuplicateSerie: boolean;
  hasDuplicateNombre: boolean;
  reasons: string[];
}

export interface DuplicateAnalysisResult {
  groups: DuplicateGroup[];
  duplicateItemIds: Set<string>;
  itemMap: Map<string, DuplicateInfo>;
  totalDuplicateItems: number;
  placaDuplicatesCount: number;
  serieDuplicatesCount: number;
  nombreDuplicatesCount: number;
}

const IGNORED_SERIALS = new Set([
  '',
  'n/a',
  'na',
  'none',
  'sin serie',
  'sin s/n',
  's/n',
  '-',
  '--',
  '0',
  '0000',
  '1234',
  'desconocido',
]);

export function analyzeDuplicates(items: InventoryItem[]): DuplicateAnalysisResult {
  const placaMap = new Map<string, InventoryItem[]>();
  const serieMap = new Map<string, InventoryItem[]>();
  const nombreMap = new Map<string, InventoryItem[]>();

  items.forEach(item => {
    // 1. Placa
    const pKey = (item.placa || '').trim().toLowerCase();
    if (pKey) {
      const arr = placaMap.get(pKey) || [];
      arr.push(item);
      placaMap.set(pKey, arr);
    }

    // 2. No. Serie
    const sKey = (item.noSerie || '').trim().toLowerCase();
    if (sKey && !IGNORED_SERIALS.has(sKey)) {
      const arr = serieMap.get(sKey) || [];
      arr.push(item);
      serieMap.set(sKey, arr);
    }

    // 3. Nombre de Equipo
    const nKey = (item.nombreEquipo || '').trim().toLowerCase();
    if (nKey) {
      const arr = nombreMap.get(nKey) || [];
      arr.push(item);
      nombreMap.set(nKey, arr);
    }
  });

  const groups: DuplicateGroup[] = [];
  const duplicateItemIds = new Set<string>();
  const itemMap = new Map<string, DuplicateInfo>();

  const getOrInitInfo = (id: string): DuplicateInfo => {
    let info = itemMap.get(id);
    if (!info) {
      info = {
        isDuplicate: false,
        hasDuplicatePlaca: false,
        hasDuplicateSerie: false,
        hasDuplicateNombre: false,
        reasons: [],
      };
      itemMap.set(id, info);
    }
    return info;
  };

  let placaDuplicatesCount = 0;
  let serieDuplicatesCount = 0;
  let nombreDuplicatesCount = 0;

  // Process Placa duplicates
  placaMap.forEach((matchedItems, key) => {
    if (matchedItems.length > 1) {
      placaDuplicatesCount++;
      const sampleVal = matchedItems[0].placa.trim();
      groups.push({
        id: `dup-placa-${key}`,
        type: 'placa',
        typeLabel: 'Placa Repetida',
        fieldLabel: 'Placa / Asset Tag',
        value: sampleVal,
        items: matchedItems,
      });

      matchedItems.forEach(i => {
        duplicateItemIds.add(i.id);
        const info = getOrInitInfo(i.id);
        info.isDuplicate = true;
        info.hasDuplicatePlaca = true;
        info.reasons.push(`Placa "${sampleVal}" repetida (${matchedItems.length} equipos)`);
      });
    }
  });

  // Process No. Serie duplicates
  serieMap.forEach((matchedItems, key) => {
    if (matchedItems.length > 1) {
      serieDuplicatesCount++;
      const sampleVal = matchedItems[0].noSerie.trim();
      groups.push({
        id: `dup-serie-${key}`,
        type: 'noSerie',
        typeLabel: 'No. Serie Repetido',
        fieldLabel: 'No. Serie (S/N)',
        value: sampleVal,
        items: matchedItems,
      });

      matchedItems.forEach(i => {
        duplicateItemIds.add(i.id);
        const info = getOrInitInfo(i.id);
        info.isDuplicate = true;
        info.hasDuplicateSerie = true;
        info.reasons.push(`No. Serie "${sampleVal}" repetido (${matchedItems.length} equipos)`);
      });
    }
  });

  // Process Nombre de Equipo duplicates
  nombreMap.forEach((matchedItems, key) => {
    if (matchedItems.length > 1) {
      nombreDuplicatesCount++;
      const sampleVal = matchedItems[0].nombreEquipo.trim();
      groups.push({
        id: `dup-nombre-${key}`,
        type: 'nombreEquipo',
        typeLabel: 'Nombre de Equipo Repetido',
        fieldLabel: 'Nombre de Equipo / Hostname',
        value: sampleVal,
        items: matchedItems,
      });

      matchedItems.forEach(i => {
        duplicateItemIds.add(i.id);
        const info = getOrInitInfo(i.id);
        info.isDuplicate = true;
        info.hasDuplicateNombre = true;
        info.reasons.push(`Nombre "${sampleVal}" repetido (${matchedItems.length} equipos)`);
      });
    }
  });

  return {
    groups,
    duplicateItemIds,
    itemMap,
    totalDuplicateItems: duplicateItemIds.size,
    placaDuplicatesCount,
    serieDuplicatesCount,
    nombreDuplicatesCount,
  };
}
