// IndexedDB pour cache local des messages
const DB_NAME = 'vokyvo_cache';
const DB_VERSION = 2;
const STORE_MESSAGES = 'messages';
const STORE_CONVERSATIONS = 'conversations';

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
      if (!db.objectStoreNames.contains(STORE_CONVERSATIONS)) {
        db.createObjectStore(STORE_CONVERSATIONS, { keyPath: 'key' });
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

export async function sauvegarderConversations(data: {users: any[], groupes: any[]}): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CONVERSATIONS, 'readwrite');
      const store = tx.objectStore(STORE_CONVERSATIONS);
      const req = store.put({ key: 'list', users: data.users, groupes: data.groupes, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('db save conversations error', e);
  }
}

export async function chargerConversations(): Promise<{users: any[], groupes: any[]} | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CONVERSATIONS, 'readonly');
      const store = tx.objectStore(STORE_CONVERSATIONS);
      const req = store.get('list');
      req.onsuccess = () => {
        const data = req.result;
        resolve(data ? { users: data.users, groupes: data.groupes } : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('db load conversations error', e);
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
