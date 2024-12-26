import { type ClassValue, clsx } from 'clsx';
import { customAlphabet } from 'nanoid';
import { twMerge } from 'tailwind-merge';
const randomId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 25);

const UUID_KEY = 'uuid';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const emptyFn = (): any => undefined;

export const generateId = () => randomId();

export const getWorkspaceId = (): string => {
    let workspaceId = localStorage.getItem(UUID_KEY);

    if (!workspaceId) {
        workspaceId = randomId(8);
        localStorage.setItem(UUID_KEY, workspaceId);
    }

    return workspaceId;
};

export const generateDiagramId = () => {
    const prefix = getWorkspaceId();

    return `${prefix}${randomId(4)}`;
};

export const getOperatingSystem = (): 'mac' | 'windows' | 'unknown' => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Mac OS X')) {
        return 'mac';
    }
    if (userAgent.includes('Windows')) {
        return 'windows';
    }
    return 'unknown';
};

export const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    waitFor: number
) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
};

export const removeDups = <T>(array: T[]): T[] => {
    return [...new Set(array)];
};

export const decodeBase64ToUtf16LE = (base64: string) => {
    const binaryString = atob(base64);

    const charCodes = new Uint16Array(binaryString.length / 2);

    for (let i = 0; i < charCodes.length; i++) {
        charCodes[i] =
            binaryString.charCodeAt(i * 2) +
            (binaryString.charCodeAt(i * 2 + 1) << 8);
    }

    return String.fromCharCode(...charCodes);
};

export const decodeBase64ToUtf8 = (base64: string) => {
    const binaryString = atob(base64);

    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
};

export const waitFor = async (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const sha256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);

    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    return hashHex;
};

// export const exportIndexedDB = (dbName: string): Promise<string> => {
//     return new Promise<string>((resolve, reject) => {
//         const request = indexedDB.open(dbName);

//         request.onsuccess = (event) => {
//             const db = (event.target as IDBOpenDBRequest).result;
//             const transaction = db.transaction(db.objectStoreNames, 'readonly');
//             const exportData: Record<string, any[]> = {};

//             let pendingStores = db.objectStoreNames.length;

//             Array.from(db.objectStoreNames).forEach((storeName) => {
//                 const objectStore = transaction.objectStore(storeName);
//                 const getAllRequest = objectStore.getAll();

//                 getAllRequest.onsuccess = (event) => {
//                     exportData[storeName] = (event.target as IDBRequest).result;
//                     pendingStores--;
//                     console.log(exportData)
//                     if (pendingStores === 0) {
//                         resolve(JSON.stringify(exportData, null, 2));
//                     }
//                 };

//                 getAllRequest.onerror = () => {
//                     reject(`Error reading data from store: ${storeName}`);
//                 };
//             });
//         };

//         request.onerror = () => {
//             reject('Error opening the IndexedDB.');
//         };
//     });
// }

// export const importIndexedDB = (dbName: string, data: string): Promise<string> => {
//     return new Promise<string>((resolve, reject) => {
//         const importData = JSON.parse(data);
//         const storeNames = Object.keys(importData);
//         const request = indexedDB.open(dbName, Date.now());

//         request.onupgradeneeded = (event) => {
//             const db = (event.target as IDBOpenDBRequest).result;
//             storeNames.forEach((storeName) => {
//                 if (!db.objectStoreNames.contains(storeName)) {
//                     db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
//                 }
//             });
//         };

//         request.onsuccess = async (event) => {
//             const db = (event.target as IDBOpenDBRequest).result;

//             try {
//                 const storePromises = storeNames.map(async (storeName) => {
//                     if (!db.objectStoreNames.contains(storeName)) {
//                         throw new Error(`Object store "${storeName}" does not exist.`);
//                     }

//                     const transaction = db.transaction([storeName], 'readwrite');
//                     const objectStore = transaction.objectStore(storeName);

//                     // Clear the store
//                     await new Promise<void>((resolve, reject) => {
//                         const clearRequest = objectStore.clear();
//                         clearRequest.onsuccess = () => resolve();
//                         clearRequest.onerror = (event) => reject(event.target.error);
//                     });

//                     // Insert new records
//                     const records = importData[storeName];
//                     if (records && records.length > 0) {
//                         await Promise.all(
//                             records.map((record) =>
//                                 new Promise<void>((resolve, reject) => {
//                                     const putRequest = objectStore.put(record);
//                                     putRequest.onsuccess = () => resolve();
//                                     putRequest.onerror = (event) => reject(event.target.error);
//                                 })
//                             )
//                         );
//                     }
//                 });

//                 await Promise.all(storePromises);
//                 resolve('Data imported successfully.');
//             } catch (error) {
//                 reject(`Error during import: ${error.message}`);
//             }
//         };

//         request.onerror = (event) => {
//             reject(`Error opening the IndexedDB: ${event.target.error}`);
//         };
//     });
// };
