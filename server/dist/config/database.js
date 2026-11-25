"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../utils/logger");
if (!process.env.MONGOMS_VERSION) {
    process.env.MONGOMS_VERSION = '6.0.14';
}
// Ensure required Windows VC++ runtime DLLs are available in PATH for mongod.exe
if (process.platform === 'win32') {
    const possiblePaths = [
        path_1.default.join(process.env.USERPROFILE || '', '.cache', 'mongodb-binaries'),
        'C:\\Program Files\\Microsoft OneDrive\\26.153.0809.0004',
    ];
    for (const p of possiblePaths) {
        if (fs_1.default.existsSync(p) && !process.env.PATH?.includes(p)) {
            process.env.PATH = `${p};${process.env.PATH}`;
        }
    }
}
let mongoServer = null;
const connectDatabase = async () => {
    const uri = process.env.MONGODB_URI?.trim();
    // If a MongoDB URI is configured, try connecting to it first
    if (uri) {
        try {
            logger_1.logger.info('Connecting to configured MongoDB URI...');
            await mongoose_1.default.connect(uri, {
                dbName: 'crimeverse',
                serverSelectionTimeoutMS: 3000,
            });
            logger_1.logger.info('✅ Database connected successfully');
            return;
        }
        catch (error) {
            if (process.env.NODE_ENV !== 'production' &&
                (error.name === 'MongooseServerSelectionError' ||
                    error.message?.includes('ECONNREFUSED') ||
                    error.message?.includes('connect'))) {
                logger_1.logger.warn(`⚠️ Could not connect to configured MongoDB (${error.message}). Falling back to in-memory MongoDB (development mode)...`);
            }
            else {
                logger_1.logger.error('❌ Database connection failed:', error);
                process.exit(1);
            }
        }
    }
    // Fallback to in-memory MongoDB for local development
    try {
        logger_1.logger.info('Starting in-memory MongoDB (development mode)...');
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create({
            instance: { dbName: 'crimeverse' },
        });
        const memoryUri = mongoServer.getUri();
        logger_1.logger.info(`In-memory MongoDB started at: ${memoryUri}`);
        await mongoose_1.default.connect(memoryUri, {
            dbName: 'crimeverse',
        });
        logger_1.logger.info('✅ Database connected successfully');
    }
    catch (error) {
        logger_1.logger.error('❌ In-memory Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    await mongoose_1.default.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
};
exports.disconnectDatabase = disconnectDatabase;
//# sourceMappingURL=database.js.map