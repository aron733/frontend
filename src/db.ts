// IndexedDB pour cache local des messages
const DB_NAME = 'vokyvo_cache';
const DB_VERSION = 1;
const STORE_MESSAGES = 'messages';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
        const store = db.createObjectStore(STORE_MESSAGES, { keyPath: 'convId' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });

  return dbPromise;
}

export async function sauvegarderMessages(convId: string, messages: any[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MESSAGES, 'readwrite');
      const store = tx.objectStore(STORE_MESSAGES);
      const req = store.put({ convId, messages, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('db save error', e);
  }
}

export async function chargerMessages(convId: string): Promise<any[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MESSAGES, 'readonly');
      const store = tx.objectStore(STORE_MESSAGES);
      const req = store.get(convId);
      req.onsuccess = () => {
        const data = req.result;
        resolve(data ? data.messages : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('db load error', e);
    return null;
  }
}

export async function viderCache(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MESSAGES, 'readwrite');
      const store = tx.objectStore(STORE_MESSAGES);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('db clear error', e);
  }
}
