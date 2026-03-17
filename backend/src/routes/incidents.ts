import { Router, Request, Response } from 'express';
import {
  createIncident,
  getIncidentById,
  getIncidents,
  assignIncidentToHospital,
  updateIncidentStatus,
  addVaccinationRecord,
  getIncidentStatistics,
  findNearbyHospitals,
} from '../services/incidentService';
import {
  validateIncidentReport,
  validateStatusUpdate,
  validateHospitalAssignment,
  validateVaccinationRecord,
} from '../validators/incidentValidator';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/incidents
 * Create a new incident report
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.user?.userId) {
      return res.status(401).json({
        error: { message: 'User not authenticated' },
      });
    }

    // Validate input
    const validation = validateIncidentReport(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          errors: validation.errors,
        },
      });
    }

    // Get user details
    const User = (await import('../models/User')).default;
    const user = await User.findById(authReq.user.userId);

    if (!user) {
      return res.status(404).json({
        error: { message: 'User not found' },
      });
    }

    // Create incident
    const result = await createIncident({
      reporterId: authReq.user.userId,
      reporterName: user.name,
      reporterPhone: user.phone || '',
      reporterEmail: user.email,
      incidentDate: new Date(req.body.incidentDate),
      location: req.body.location,
      description: req.body.description,
      severity: req.body.severity,
      victimAge: req.body.victimAge,
      victimGender: req.body.victimGender,
      dogDescription: req.body.dogDescription,
      dogColor: req.body.dogColor,
      dogSize: req.body.dogSize,
      isStray: req.body.isStray,
      dogOwnerInfo: req.body.dogOwnerInfo,
      photos: req.body.photos || [],
    });

    return res.status(201).json({
      message: 'Incident reported successfully',
      ...result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: { message: err.message || 'Failed to create incident' },
    });
  }
});

/**
 * GET /api/incidents
 * Get list of incidents (filtered by user role)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.user?.userId) {
      return res.status(401).json({
        error: { message: 'User not authenticated' },
      });
    }

    // Get user role
    const User = (await import('../models/User')).default;
    const user = await User.findById(authReq.user.userId);

    if (!user) {
      return res.status(404).json({
        error: { message: 'User not found' },
      });
    }

    // Parse filters
    const filters = {
      status: req.query.status as string,
      severity: req.query.severity as string,
      city: req.query.city as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await getIncidents(authReq.user.userId, user.role, filters);

    return res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: { message: err.message || 'Failed to fetch incidents' },
    });
  }
});

/**
 * GET /api/incidents/statistics
 * Get incident statistics
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.user?.userId) {
      return res.status(401).json({
        error: { message: 'User not authenticated' },
      });
    }

    // Get user role - only authority and animal_control can access statistics
    const User = (await import('../models/User')).default;
    const user = await User.findById(authReq.user.userId);

    if (!user || (user.role !== 'authority' && user.role !== 'animal_control')) {
      return res.status(403).json({
        error: { message: 'Access denied' },
      });
    }

    const filters = {
      city: req.query.city as string,
      state: req.query.state as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };

    const statistics = await getIncidentStatistics(filters);

    return res.status(200).json(statistics);
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: { message: err.message || 'Failed to fetch statistics' },
    });
  }
});

/**
 * GET /api/incidents/nearby-hospitals
 * Find nearby hospitals with anti-rabies vaccine
 */
router.get('/nearby-hospitals', async (req: Request, res: Response) => {
  try {
    const { lng, lat, maxDistance } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        error: { message: 'Longitude and latitude are required' },
      });
    }

    const coordinates: [number, number] = [parseFloat(lng as string), parseFloat(lat as string)];
    const maxDistanceKm = maxDistance ? parseFloat(maxDistance as string) : 10;

    const hospitals = await findNearbyHospitals(coordinates, maxDistanceKm);

    return res.status(200).json({
      hospitals: hospitals.map(h => ({
        id: h._id.toString(),
        name: h.name,
        phone: h.phone,
        email: h.email,
        address: h.location.address,
        city: h.location.city,
        type: h.type,
        distance: Math.round(h.distance), // in meters
        distanceKm: (h.distance / 1000).toFixed(2),
        hasVaccine: h.hasAntiRabiesVaccine,
        emergencyContact: h.emergencyContact,
      })),
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: { message: err.message || 'Failed to find nearby hospitals' },
    });
  }
});

/**
 * GET /api/incidents/:id
 * Get incident details by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.user?.userId) {
      return res.status(401).json({
        error: { message: 'User not authenticated' },
      });
    }

    // Get user role
    const User = (await import('../models/User')).default;
    const user = await User.findById(authReq.user.userId);

    if (!user) {
      return res.status(404).json({
        error: { message: 'User not found' },
      });
    }

    const incident = await getIncidentById(req.params.id, authReq.user.userId, user.role);

    return res.status(200).json({ incident });
  } catch (error: unknown) {
    const err = error as Error;
    const statusCode = err.message === 'Access denied' ? 403 : 
                       err.message === 'Incident not found' ? 404 : 500;
    return res.status(statusCode).json({
      error: { message: err.message || 'Failed to fetch incident' },
    });
  }
});

/**
 * PUT /api/incidents/:id/assign
 * Assign incident to hospital
 */
router.put('/:id/assign', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.user?.userId) {
      return res.status(401).json({
        error: { message: 'User not authenticated' },
      });
    }

    // Only hospital staff and authority can assign incidents
    const User = (await import('../models/User')).default;
    const user = await User.findById(authReq.user.userId);

    if (!user || (user.role !== 'hospital' && user.role !== 'authority')) {
      return res.status(403).json({
        error: { message: 'Access denied' },
      });
    }

    // Validate input
    const validation = validateHospitalAssignment(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          errors: validation.errors,
        },
      });
    }

    const incident = await assignIncidentToHospital(
      req.params.id,
      req.body.hospitalId,
      req.body.staffId,
      req.body.notes
    );

    return res.status(200).json({
      message: 'Incident assigned successfully',
      incident,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: { message: err.message || 'Failed to assign incident' },
    });
  }
});

/**
 * PUT /api/incidents/:id/status
 * Update incident status
 */
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.user?.userId) {
      return res.status(401).json({
        error: { message: 'User not authenticated' },
      });
    }

    // Validate input
    const validation = validateStatusUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          errors: validation.errors,
        },
      });
    }

    const incident = await updateIncidentStatus(
      req.params.id,
      req.body.status,
      req.body.notes,
      authReq.user.userId
    );

    return res.status(200).json({
      message: 'Incident status updated successfully',
      incident,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: { message: err.message || 'Failed to update incident status' },
    });
  }
});

/**
 * POST /api/incidents/:id/vaccination
 * Add vaccination record
 */
router.post('/:id/vaccination', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.user?.userId) {
      return res.status(401).json({
        error: { message: 'User not authenticated' },
      });
    }

    // Only hospital staff can add vaccination records
    const User = (await import('../models/User')).default;
    const user = await User.findById(authReq.user.userId);

    if (!user || user.role !== 'hospital') {
      return res.status(403).json({
        error: { message: 'Access denied. Only hospital staff can add vaccination records.' },
      });
    }

    // Validate input
    const validation = validateVaccinationRecord(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          errors: validation.errors,
        },
      });
    }

    const incident = await addVaccinationRecord(
      req.params.id,
      req.body.dose,
      new Date(req.body.date)
    );

    return res.status(200).json({
      message: 'Vaccination record added successfully',
      incident,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: { message: err.message || 'Failed to add vaccination record' },
    });
  }
});

export default router;
