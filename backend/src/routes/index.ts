import { Router } from 'express';
import authRoutes from './auth';
import incidentRoutes from './incidents';

const router = Router();

// Example route
router.get('/', (_req, res) => {
  res.json({ 
    message: 'Sahara API - Dog Bite Reporting & Emergency Response System',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      incidents: '/api/incidents',
    },
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Incident routes
router.use('/incidents', incidentRoutes);

export default router;
