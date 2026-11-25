import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

if (!process.env.MONGOMS_VERSION) {
  process.env.MONGOMS_VERSION = '6.0.14';
}

// Ensure required Windows VC++ runtime DLLs are available in PATH for mongod.exe
if (process.platform === 'win32') {
  const possiblePaths = [
    path.join(process.env.USERPROFILE || '', '.cache', 'mongodb-binaries'),
    'C:\\Program Files\\Microsoft OneDrive\\26.153.0809.0004',
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && !process.env.PATH?.includes(p)) {
      process.env.PATH = `${p};${process.env.PATH}`;
    }
  }
}

let mongoServer: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI?.trim();

  // If a MongoDB URI is configured, try connecting to it first
  if (uri) {
    try {
      logger.info('Connecting to configured MongoDB URI...');
      await mongoose.connect(uri, {
        dbName: 'crimeverse',
        serverSelectionTimeoutMS: 3000,
      });
      logger.info('✅ Database connected successfully');
      return;
    } catch (error: any) {
      if (
        process.env.NODE_ENV !== 'production' &&
        (error.name === 'MongooseServerSelectionError' ||
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('connect'))
      ) {
        logger.warn(
          `⚠️ Could not connect to configured MongoDB (${error.message}). Falling back to in-memory MongoDB (development mode)...`
        );
      } else {
        logger.error('❌ Database connection failed:', error);
        process.exit(1);
      }
    }
  }

  // Fallback to in-memory MongoDB for local development
  try {
    logger.info('Starting in-memory MongoDB (development mode)...');
    mongoServer = await MongoMemoryServer.create({
      instance: { dbName: 'crimeverse' },
    });
    const memoryUri = mongoServer.getUri();
    logger.info(`In-memory MongoDB started at: ${memoryUri}`);

    await mongoose.connect(memoryUri, {
      dbName: 'crimeverse',
    });

    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ In-memory Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

