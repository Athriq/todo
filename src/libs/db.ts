export interface ObjectWithKey<T> {
    primaryKey: string,
    value: T
}

/**
 * Class pembungkus untuk IndexedDB.
 * @todo make the usage of this not create connection everytime.
 */
export class DB {
    private static instance: DB;
    private dbName: string;
    private dbVersion: number;
    private db: IDBDatabase | null = null;

    private constructor(dbName: string, dbVersion: number) {
        this.dbName = dbName;
        this.dbVersion = dbVersion;
    }

    static getInstance(): DB {
        if (!DB.instance) {
            DB.instance = new DB("todo", 1); // Hardcode, tapi yaudahlah...
        }
        return DB.instance;
    }

    async openConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                reject(`Error opening database: ${event}`);
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                const objectStore = db.createObjectStore('todoItems');
                objectStore.createIndex('task', 'task', { unique: false });
                objectStore.createIndex('priority', 'priority', { unique: false });
                objectStore.createIndex('timeCreated', 'timeCreated', { unique: false });
                objectStore.createIndex('complete', 'complete', { unique: false });
            };
        });
    }

    closeConnection(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    async addObject(storeName: string, data: unknown): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction(storeName, 'readwrite');
            const objectStore = transaction?.objectStore(storeName);
            const request = objectStore?.add(data, crypto.randomUUID());

            if (!request) {
                reject("Error creating request");
                return;
            }

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject(`Error adding object: ${event}`);
            };
        });
    }

    async retrieveObject<T>(storeName: string, key: IDBValidKey | IDBKeyRange): Promise<T> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction(storeName, 'readonly');
            const objectStore = transaction?.objectStore(storeName);
            const request = objectStore?.get(key);

            if (!request) {
                reject("Error creating request");
                return;
            }

            request.onsuccess = () => {
                const result = request?.result;
                resolve(result);
            };

            request.onerror = (event) => {
                reject(`Error retrieving object: ${event}`);
            };
        });
    }

    async retrieveAllObjects<T>(storeName: string): Promise<ObjectWithKey<T>[]> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction(storeName, 'readonly');
            const objectStore = transaction?.objectStore(storeName);
            const request = objectStore?.openCursor();
            const result: ObjectWithKey<T>[] = [];

            if (!request) {
                reject("Error creating request");
                return;
            }

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    result.push(<ObjectWithKey<T>>{
                        primaryKey: cursor.primaryKey,
                        value: cursor.value
                    });
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };

            request.onerror = (event) => {
                reject(`Error retrieving all objects: ${event}`);
            };
        });
    }

    async updateObject<T>(storeName: string, key: IDBValidKey | undefined, newData: T): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction(storeName, 'readwrite');
            const objectStore = transaction?.objectStore(storeName);
            const request = objectStore?.put(newData, key);

            if (!request) {
                reject("Error creating request");
                return;
            }

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject(`Error updating object: ${event}`);
            };
        });
    }

    async deleteObject(storeName: string, key: IDBValidKey | IDBKeyRange): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction(storeName, 'readwrite');
            const objectStore = transaction?.objectStore(storeName);
            const request = objectStore?.delete(key);

            if (!request) {
                reject("Error creating request");
                return;
            }

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject(`Error deleting object: ${event}`);
            };
        });
    }
}
