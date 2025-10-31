import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { runMigrations } from './database/migrate';
import authRoutes from './routes/auth';
import brutosRoutes from './routes/brutos';
import battlesRoutes from './routes/battles';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/brutos', brutosRoutes);
app.use('/api/battles', battlesRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[Server] Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
async function start() {
  try {
    console.log('[Server] Running database migrations...');
    runMigrations();

    app.listen(PORT, () => {
      console.log(`[Server] ✓ Backend server running on http://localhost:${PORT}`);
      console.log(`[Server] ✓ API available at http://localhost:${PORT}/api`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

start();
