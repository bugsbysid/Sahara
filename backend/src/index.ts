import express, { Express } from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';
import helmet from 'helmet';
import { config } from './config';
import { connectDatabase } from './config/database';
import { validateEnv } from './utils/env-validator';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestId } from './middleware/requestId';
import { logger } from './utils/logger';

// Import passport config (may throw if misconfigured)
try {
  logger.debug('Loading passport configuration...');
  require('./config/passport');
  logger.debug('Passport configuration loaded successfully');
} catch (error) {
  logger.error('Failed to load passport configuration:', error);
  process.exit(1);
}

// Import routes (may throw if misconfigured)
let routes: any;
try {
  logger.debug('Loading routes...');
  routes = require('./routes').default;
  logger.debug('Routes loaded successfully');
} catch (error) {
  logger.error('Failed to load routes:', error);
  process.exit(1);
}

// Validate environment variables on startup
try {
  validateEnv();
  logger.info('Environment variables validated');
} catch (error) {
  logger.error('Environment validation failed', error);
  process.exit(1);
}

// Async initialization function
async function initializeApp() {
  console.log('DEBUG: Starting app initialization...');
  logger.debug('Starting app initialization...');
  const app: Express = express();
  console.log('DEBUG: Express app created');
  logger.debug('Express app created');

  // Trust proxy - Required when running behind a reverse proxy (Render, Heroku, etc.)
  // This enables Express to correctly identify the client's IP address
  app.set('trust proxy', 1);
  console.log('DEBUG: Trust proxy configured');
  logger.debug('Trust proxy configured');

  // Connect to database FIRST (required for session store and authentication)
  try {
    await connectDatabase();
    console.log('DEBUG: Database connection completed');
    logger.debug('Database connection completed');
  } catch (error) {
    console.log('DEBUG: Database connection failed');
    logger.error('Failed to connect to database', error);
    process.exit(1);
  }

  // Request ID middleware (must be early to track all requests)
  app.use(requestId);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: config.nodeEnv === 'production',
    crossOriginEmbedderPolicy: false,
  }));

  // CORS middleware
  const allowedOrigins = [
    config.frontend.url,
    // Add additional allowed origins for production if needed
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [])
  ].filter(Boolean); // Remove any empty strings

  app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin in development (for testing with Postman, curl, etc.)
      if (!origin && config.nodeEnv === 'development') {
        return callback(null, true);
      }
      
      // In production, require explicit origin for security
      if (!origin && config.nodeEnv === 'production') {
        logger.warn('CORS: Blocked request with no origin in production');
        return callback(new Error('Not allowed by CORS'));
      }
      
      // Check if origin is in allowed list
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS: Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    maxAge: config.nodeEnv === 'production' ? 86400 : 0, // 24 hours in production, no cache in dev
  }));

  // Body parsing middleware
  try {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    logger.debug('Body parsing middleware configured');
  } catch (error) {
    logger.error('Failed to configure body parsing:', error);
    throw error;
  }

  // Session middleware for Passport
  // Use MongoDB session store in production, MemoryStore in development
  try {
    const sessionConfig: session.SessionOptions = {
        secret: config.session.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: config.nodeEnv === 'production',
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
        },
    };

    // Use MongoDB session store in production
    if (config.nodeEnv === 'production') {
      try {
        sessionConfig.store = MongoStore.create({
          client: mongoose.connection.getClient(),
          collectionName: 'sessions',
          ttl: 24 * 60 * 60, // 24 hours
          autoRemove: 'native',
        });
        logger.info('Using MongoDB session store');
      } catch (error) {
        logger.error('Failed to create MongoDB session store:', error);
        throw error;
      }
    } else {
      logger.debug('Using MemoryStore for sessions (development only)');
    }

    app.use(session(sessionConfig));
    logger.debug('Session middleware configured');
  } catch (error) {
    logger.error('Failed to configure session middleware:', error);
    throw error;
  }

  // Initialize Passport
  try {
    app.use(passport.initialize());
    app.use(passport.session());
    logger.debug('Passport initialized');
  } catch (error) {
    logger.error('Failed to initialize Passport:', error);
    throw error;
  }

  // Basic route
  app.get('/', (_req, res) => {
    res.json({ 
      message: 'Welcome to Express API',
      status: 'running',
      timestamp: new Date().toISOString()
    });
  });

  // Health check route (should be accessible without CORS restrictions)
  app.get('/health', async (_req, res) => {
    try {
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      const health = {
        status: dbStatus === 'connected' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        uptime: process.uptime(),
      };

      const statusCode = dbStatus === 'connected' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'error',
      });
    }
  });

  // Health check HEAD endpoint (for load balancers and monitoring)
  app.head('/health', async (_req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const statusCode = dbStatus === 'connected' ? 200 : 503;
    res.status(statusCode).end();
  });

  // Google OAuth routes (only if configured)
  if (config.google.clientId && config.google.clientSecret) {
    app.get(
      '/api/auth/google',
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get(
      '/api/auth/google/callback',
      passport.authenticate('google', { session: false, failureRedirect: `${config.frontend.url}/login?error=google_auth_failed` }),
      async (req: express.Request, res: express.Response) => {
        try {
          // The user data is returned from the Passport strategy
          const authResult = req.user as { user?: { id: string }; token?: string } | undefined;
          if (authResult?.token) {
            const frontendUrl = config.frontend.url;
            res.redirect(`${frontendUrl}/auth/callback?token=${authResult.token}`);
          } else {
            res.redirect(`${config.frontend.url}/login?error=google_auth_failed`);
          }
        } catch (error) {
          res.redirect(`${config.frontend.url}/login?error=google_auth_failed`);
        }
      }
    );
  } else {
    // Placeholder routes if Google OAuth is not configured
    app.get('/api/auth/google', (_req, res) => {
      res.status(501).json({ error: { message: 'Google OAuth is not configured' } });
    });
    app.get('/api/auth/google/callback', (_req, res) => {
      res.status(501).json({ error: { message: 'Google OAuth is not configured' } });
    });
  }

  // API routes
  try {
    app.use('/api', routes);
    logger.debug('API routes configured');
  } catch (error) {
    logger.error('Failed to configure API routes:', error);
    throw error;
  }

  // Error handling middleware (must be last)
  try {
    app.use(notFound);
    app.use(errorHandler);
    logger.debug('Error handling middleware configured');
  } catch (error) {
    logger.error('Failed to configure error handlers:', error);
    throw error;
  }

  // Start server
  const PORT = config.port;
  logger.debug(`Attempting to start server on port ${PORT}`);

  const server = app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Frontend URL: ${config.frontend.url}`);
    
    // Log email service status (check matches emailService.ts logic)
    const hasEmailUser = config.email.user && config.email.user.trim() !== '';
    const hasEmailPass = config.email.pass && config.email.pass.trim() !== '';
    
    if (hasEmailUser && hasEmailPass) {
      logger.info('Email service: Configured ✓');
      logger.debug(`Email host: ${config.email.host}:${config.email.port}`);
      logger.debug(`Email from: ${config.email.from}`);
    } else {
      logger.warn('Email service: Not configured (password reset links will appear in console)');
      logger.warn('To enable email service, add EMAIL_USER and EMAIL_PASS to backend/.env file');
      if (process.env.NODE_ENV === 'development') {
        logger.info(`   EMAIL_USER from env: ${process.env.EMAIL_USER ? `"${process.env.EMAIL_USER}"` : 'NOT SET'}`);
        logger.info(`   EMAIL_PASS from env: ${process.env.EMAIL_PASS ? 'SET (hidden)' : 'NOT SET'}`);
        logger.info(`   config.email.user: ${config.email.user ? `"${config.email.user}"` : 'empty'}`);
        logger.info(`   config.email.pass: ${config.email.pass ? 'SET (hidden)' : 'empty'}`);
      }
    }
  });

  return { app, server };
}

// Start the application
logger.info('About to call initializeApp()...');
initializeApp().catch((error) => {
  logger.error('Failed to initialize application:');
  logger.error('Error type:', typeof error);
  logger.error('Error value:', error);
  if (error instanceof Error) {
    logger.error('Error name:', error.name);
    logger.error('Error message:', error.message);
    logger.error('Error stack:', error.stack);
  }
  try {
    logger.error('Error stringified:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  } catch (e) {
    logger.error('Could not stringify error');
  }
  process.exit(1);
});

// Graceful shutdown handler for production
const gracefulShutdown = (signal: string): void => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Note: server will be available after initializeApp completes
  setTimeout(() => {
    mongoose.connection.close().then(() => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    }).catch((error) => {
      logger.error('Error closing MongoDB connection:', error);
      process.exit(1);
    });
  }, 100);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in development, but log the error
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('unhandledRejection');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: unknown) => {
  logger.error('Uncaught Exception:');
  logger.error('Type of error:', typeof error);
  
  if (error instanceof Error) {
    logger.error('Error name:', error.name);
    logger.error('Error message:', error.message);
    logger.error('Error stack:', error.stack);
  } else if (error && typeof error === 'object') {
    logger.error('Error object (not Error instance):', JSON.stringify(error, null, 2));
  } else {
    logger.error('Error value:', String(error));
  }
  
  // Log all properties
  try {
    logger.error('All error properties:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  } catch (e) {
    logger.error('Could not stringify error');
  }
  
  gracefulShutdown('uncaughtException');
});
