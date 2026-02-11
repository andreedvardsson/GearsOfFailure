import { MongoClient, Db } from 'mongodb';

/**
 * MongoDB Connection Module
 *
 * Supports both local MongoDB (via Docker) and MongoDB Atlas (cloud).
 *
 * Environment variables:
 * - MONGODB_URI: Connection string (required at runtime, optional at build time)
 * - MONGODB_DB: Database name (default: 'team-flags-edu')
 *
 * For Docker Compose (local):
 *   MONGODB_URI=mongodb://admin:password@db:27017/team-flags-edu?authSource=admin
 *
 * For MongoDB Atlas (cloud):
 *   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/team-flags-edu
 */

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

// Only initialize if URI is provided (skip during build time)
if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so the MongoClient is not constantly created
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, create a new client for each request
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // During build time or when not configured
  console.log('ℹ️ MongoDB URI not configured - database features disabled');
  console.log('📚 Set MONGODB_URI in .env to enable database connection');
}

export async function getDatabase(): Promise<Db> {
  if (!clientPromise) {
    throw new Error(
      'MongoDB not configured. Set MONGODB_URI environment variable.\n' +
        'For local Docker: mongodb://admin:password@db:27017/team-flags-edu?authSource=admin\n' +
        'For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/team-flags-edu'
    );
  }
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || 'team-flags-edu';
  return client.db(dbName);
}

// Check if MongoDB is configured
export function isMongoDBConfigured(): boolean {
  return !!uri;
}

export default clientPromise;
