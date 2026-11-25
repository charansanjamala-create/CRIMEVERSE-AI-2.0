import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { connectDatabase } from './config/database';
import { config } from './config/env';
import { logger } from './utils/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import apiRoutes from './routes/api.routes';

const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use(rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// General middleware
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CRIMEVERSE AI 2.0 API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    aiProvider: config.aiProvider,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();

    // Auto-seed on first start
    try {
      const { seedDatabase } = await import('./seed/seed');
      await seedDatabase();
    } catch (err) {
      logger.warn('Seed skipped or already seeded:', (err as Error).message);
    }

    app.listen(config.port, () => {
      logger.info(`🚀 CRIMEVERSE AI 2.0 Server running on port ${config.port}`);
      logger.info(`📡 API: http://localhost:${config.port}/api`);
      logger.info(`🤖 AI Provider: ${config.aiProvider}`);
      logger.info(`🌐 Client URL: ${config.clientUrl}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
