import { BusinessDocument, Asset, DocumentType } from '../types';

const STORAGE_KEY = 'bizdoc_pro_data';
const ASSETS_KEY = 'bizdoc_pro_assets';
const PREFS_KEY = 'bizdoc_pro_prefs';

export interface LogoSettings {
  logoUrl?: string;
  logoSize?: number;
  logoPosition?: number;
}

export interface UserPreferences {
  typeSettings: Partial<Record<DocumentType, LogoSettings>>;
}

export const saveDocuments = (documents: BusinessDocument[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    return true;
  } catch (error) {
    console.error('Failed to save documents:', error);
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert('Storage limit exceeded! Try deleting old assets or using smaller images.');
    } else {
      alert('An error occurred while saving. Please try again.');
    }
    return false;
  }
};

export const loadDocuments = (): BusinessDocument[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load documents:', e);
    return [];
  }
};

export const addOrUpdateDocument = (doc: BusinessDocument) => {
  const docs = loadDocuments();
  const index = docs.findIndex(d => d.id === doc.id);
  const updatedDocs = [...docs];
  
  if (index >= 0) {
    updatedDocs[index] = { ...doc, updatedAt: Date.now() };
  } else {
    updatedDocs.push({ ...doc, createdAt: doc.createdAt || Date.now() });
  }
  
  const success = saveDocuments(updatedDocs);
  return success ? updatedDocs : docs;
};

export const deleteDocument = (id: string) => {
  const docs = loadDocuments();
  const filtered = docs.filter(d => d.id !== id);
  saveDocuments(filtered);
  return filtered;
};

// Asset Library Utils
export const loadAssets = (): Asset[] => {
  try {
    const data = localStorage.getItem(ASSETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveAsset = (asset: Asset) => {
  try {
    const assets = loadAssets();
    assets.push(asset);
    localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
    return assets;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert('Library storage full! Delete some unused images first.');
    }
    return loadAssets();
  }
};

export const deleteAsset = (id: string) => {
  const assets = loadAssets();
  const filtered = assets.filter(a => a.id !== id);
  localStorage.setItem(ASSETS_KEY, JSON.stringify(filtered));
  return filtered;
};

// User Preferences Utils
export const saveTypePreferences = (type: DocumentType, settings: LogoSettings) => {
  try {
    const prefs = loadPreferences();
    if (!prefs.typeSettings) prefs.typeSettings = {};
    prefs.typeSettings[type] = settings;
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
};

export const loadPreferences = (): UserPreferences => {
  try {
    const data = localStorage.getItem(PREFS_KEY);
    return data ? JSON.parse(data) : { typeSettings: {} };
  } catch (e) {
    return { typeSettings: {} };
  }
};

export const getTypePreferences = (type: DocumentType): LogoSettings | undefined => {
  const prefs = loadPreferences();
  return prefs.typeSettings?.[type];
};