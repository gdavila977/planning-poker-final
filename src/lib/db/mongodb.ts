// Ruta del archivo: /src/lib/db/mongodb.ts

import { MongoClient, Db } from 'mongodb';

/**
 * Variables para manejar la conexión a MongoDB
 * @private clientPromise - Promesa del cliente de MongoDB
 * @private client - Cliente de MongoDB
 * @private db - Instancia de la base de datos
 */
let clientPromise: Promise<MongoClient>;
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * URI de conexión a MongoDB
 * Conectamos a una instancia local de MongoDB corriendo en Docker
 */
const MONGODB_URI = 'mongodb://localhost:27017/planning-poker-final';

/**
 * Opciones de configuración para el cliente de MongoDB
 */
const options = {};

/**
 * Inicializa la conexión a MongoDB si no existe
 * @returns Promise<Db> - Promesa que resuelve a la instancia de la base de datos
 */
export async function connectToDatabase(): Promise<Db> {
    try {
        // Si ya tenemos una instancia de la base de datos, la retornamos
        if (db) {
            return db;
        }

        // Si no hay cliente, creamos uno nuevo
        if (!client) {
            client = new MongoClient(MONGODB_URI, options);
            // Guardamos la promesa de conexión
            clientPromise = client.connect();
        }

        // Esperamos a que se establezca la conexión
        const connectedClient = await clientPromise;
        // Obtenemos la instancia de la base de datos
        db = connectedClient.db();
        
        console.log('Conexión exitosa a MongoDB');
        return db;
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        throw error;
    }
}

/**
 * Cierra la conexión a MongoDB
 * Útil para cerrar la conexión cuando la aplicación se detiene
 */
export async function disconnectFromDatabase(): Promise<void> {
    try {
        if (client) {
            await client.close();
            client = null;
            db = null;
            console.log('Conexión a MongoDB cerrada exitosamente');
        }
    } catch (error) {
        console.error('Error al cerrar la conexión a MongoDB:', error);
        throw error;
    }
}

/**
 * Obtiene una colección específica de la base de datos
 * @param collectionName - Nombre de la colección que queremos obtener
 * @returns Promise que resuelve a la colección solicitada
 */ 

export async function getCollection(collectionName: string) {
    const db = await connectToDatabase();
    return db.collection(collectionName);
}