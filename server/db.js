import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongodInstance = null;

export async function connectDB() {
  const configuredUri = process.env.MONGODB_URI || process.env.MONGODB_URL;

  // 1. If explicit MONGODB_URI is provided, try connecting to it
  if (configuredUri && !configuredUri.includes('localhost') && !configuredUri.includes('127.0.0.1')) {
    try {
      console.log(`Connecting to remote MongoDB: ${configuredUri.split('@')[1] || configuredUri}...`);
      await mongoose.connect(configuredUri);
      console.log('Connected to remote MongoDB.');
      return configuredUri;
    } catch (err) {
      console.warn('Failed connecting to configured remote MONGODB_URI:', err.message);
    }
  }

  // 2. Try local MongoDB first with a short timeout
  const localUri = configuredUri || 'mongodb://localhost:27017/syncspace';
  try {
    console.log(`Attempting connection to local MongoDB at: ${localUri}...`);
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('Connected to local MongoDB daemon.');
    return localUri;
  } catch (err) {
    console.log('Local MongoDB daemon not detected. Starting embedded MongoDB server...');
  }

  // 3. Seamless Embedded MongoMemoryServer fallback for local MVP testing
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri() + 'syncspace';
    await mongoose.connect(memoryUri);
    console.log(`Connected to Embedded MongoDB Memory Server at: ${memoryUri}`);
    return memoryUri;
  } catch (err) {
    console.error('Fatal: Could not initialize any MongoDB connection:', err.message);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}
