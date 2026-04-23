import Incident from '../models/Incident';
import Hospital from '../models/Hospital';
import User from '../models/User';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export interface CreateIncidentData {
  reporterId: string;
  reporterName: string;
  reporterPhone?: string; // Optional
  reporterEmail: string;
  incidentDate: Date;
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    pincode?: string;
  };
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  victimAge?: number;
  victimGender?: 'male' | 'female' | 'other';
  dogDescription?: string;
  dogColor?: string;
  dogSize?: 'small' | 'medium' | 'large';
  isStray: boolean;
  dogOwnerInfo?: string;
  photos?: string[];
}

/**
 * Create a new incident report
 */
export const createIncident = async (data: CreateIncidentData) => {
  try {
    // Create incident with proper GeoJSON format
    const incident = await Incident.create({
      ...data,
      location: {
        ...data.location,
        type: 'Point', // Ensure GeoJSON type is set
      },
      status: 'reported',
      reportedAt: new Date(),
      firstAidGiven: false,
      hospitalVisited: false,
      vaccineAdministered: false,
      followUpRequired: true,
      animalControlNotified: false,
      dogCaptured: false,
    });

    logger.info(`New incident reported: ${incident._id} in ${data.location.city}`);

    // Find nearby hospitals with anti-rabies vaccine
    const nearbyHospitals = await findNearbyHospitals(
      data.location.coordinates,
      10 // 10 km radius
    );

    logger.info(`Found ${nearbyHospitals.length} nearby hospitals with vaccines`);

    // TODO: Send notifications to nearby hospitals
    // TODO: Notify animal control in the jurisdiction

    return {
      incident: {
        id: incident._id.toString(),
        reporterId: incident.reporterId.toString(),
        incidentDate: incident.incidentDate,
        location: incident.location,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        reportedAt: incident.reportedAt,
      },
      nearbyHospitals: nearbyHospitals.map(h => ({
        id: h._id.toString(),
        name: h.name,
        phone: h.phone,
        address: h.location.address,
        distance: h.distance,
        hasVaccine: h.hasAntiRabiesVaccine,
      })),
    };
  } catch (error) {
    logger.error('Error creating incident:', error);
    // Log more details for debugging
    if (error instanceof Error) {
      logger.error('Error message:', error.message);
      logger.error('Error stack:', error.stack);
    }
    throw error; // Throw the original error to preserve the message
  }
};

/**
 * Find nearby hospitals with anti-rabies vaccine
 */
export const findNearbyHospitals = async (
  coordinates: [number, number],
  maxDistanceKm: number = 10
) => {
  try {
    const hospitals = await Hospital.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: coordinates,
          },
          distanceField: 'distance',
          maxDistance: maxDistanceKm * 1000, // Convert to meters
          spherical: true,
          query: {
            isActive: true,
            hasAntiRabiesVaccine: true,
            acceptingPatients: true,
          },
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          name: 1,
          phone: 1,
          email: 1,
          location: 1,
          type: 1,
          hasAntiRabiesVaccine: 1,
          operatingHours: 1,
          emergencyContact: 1,
          distance: 1,
        },
      },
    ]);

    return hospitals;
  } catch (error) {
    logger.error('Error finding nearby hospitals:', error);
    return [];
  }
};

/**
 * Get incident by ID
 */
export const getIncidentById = async (incidentId: string, userId: string, userRole: string) => {
  try {
    const incident = await Incident.findById(incidentId)
      .populate('reporterId', 'name email phone')
      .populate('assignedHospitalId', 'name phone location')
      .populate('assignedStaffId', 'name email phone');

    if (!incident) {
      throw new Error('Incident not found');
    }

    // Check access permissions
    const canAccess = 
      userRole === 'authority' ||
      incident.reporterId.toString() === userId ||
      (userRole === 'hospital' && incident.assignedHospitalId?.toString() === userId) ||
      (userRole === 'animal_control' && incident.location.city) ||
      userRole === 'ngo';

    if (!canAccess) {
      throw new Error('Access denied');
    }

    return incident;
  } catch (error) {
    logger.error('Error fetching incident:', error);
    throw error;
  }
};

/**
 * Get incidents list with filters
 */
export const getIncidents = async (
  userId: string,
  userRole: string,
  filters: {
    status?: string;
    severity?: string;
    city?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }
) => {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Build query based on user role
    const query: any = {};

    if (userRole === 'citizen') {
      query.reporterId = userId;
    } else if (userRole === 'hospital') {
      query.assignedHospitalId = userId;
    } else if (userRole === 'animal_control' || userRole === 'ngo') {
      // Can see incidents in their jurisdiction
      const user = await User.findById(userId);
      if (user?.jurisdiction) {
        query['location.city'] = user.jurisdiction;
      }
    }
    // Authority can see all incidents

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.severity) {
      query.severity = filters.severity;
    }
    if (filters.city) {
      query['location.city'] = filters.city;
    }
    if (filters.startDate || filters.endDate) {
      query.reportedAt = {};
      if (filters.startDate) {
        query.reportedAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.reportedAt.$lte = filters.endDate;
      }
    }

    const [incidents, total] = await Promise.all([
      Incident.find(query)
        .sort({ reportedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reporterId', 'name email')
        .populate('assignedHospitalId', 'name phone')
        .lean(),
      Incident.countDocuments(query),
    ]);

    return {
      incidents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching incidents:', error);
    throw new Error('Failed to fetch incidents');
  }
};

/**
 * Assign incident to hospital
 */
export const assignIncidentToHospital = async (
  incidentId: string,
  hospitalId: string,
  staffId?: string,
  notes?: string
) => {
  try {
    const [incident, hospital] = await Promise.all([
      Incident.findById(incidentId),
      Hospital.findById(hospitalId),
    ]);

    if (!incident) {
      throw new Error('Incident not found');
    }
    if (!hospital) {
      throw new Error('Hospital not found');
    }

    incident.status = 'assigned';
    incident.assignedHospitalId = new mongoose.Types.ObjectId(hospitalId);
    incident.assignedHospitalName = hospital.name;
    incident.assignedAt = new Date();

    if (staffId) {
      const staff = await User.findById(staffId);
      if (staff) {
        incident.assignedStaffId = new mongoose.Types.ObjectId(staffId);
        incident.assignedStaffName = staff.name;
      }
    }

    if (notes) {
      incident.notes.push(`Assigned to ${hospital.name}: ${notes}`);
    }

    await incident.save();

    // Update hospital statistics
    hospital.totalIncidentsHandled += 1;
    await hospital.save();

    logger.info(`Incident ${incidentId} assigned to hospital ${hospitalId}`);

    return incident;
  } catch (error) {
    logger.error('Error assigning incident:', error);
    throw error;
  }
};

/**
 * Update incident status
 */
export const updateIncidentStatus = async (
  incidentId: string,
  status: string,
  notes?: string,
  userId?: string
) => {
  try {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      throw new Error('Incident not found');
    }

    const oldStatus = incident.status;
    incident.status = status as any;

    if (notes) {
      const user = userId ? await User.findById(userId) : null;
      const notePrefix = user ? `[${user.name}]` : '';
      incident.notes.push(`${notePrefix} Status changed from ${oldStatus} to ${status}: ${notes}`);
    }

    await incident.save();

    logger.info(`Incident ${incidentId} status updated to ${status}`);

    return incident;
  } catch (error) {
    logger.error('Error updating incident status:', error);
    throw error;
  }
};

/**
 * Add vaccination record
 */
export const addVaccinationRecord = async (
  incidentId: string,
  dose: number,
  date: Date
) => {
  try {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      throw new Error('Incident not found');
    }

    incident.vaccineAdministered = true;
    incident.vaccinationSchedule = incident.vaccinationSchedule || [];
    
    incident.vaccinationSchedule.push({
      dose,
      date,
      completed: true,
    });

    // Update status if first vaccination
    if (incident.status === 'assigned' || incident.status === 'reported') {
      incident.status = 'in_treatment';
    }

    await incident.save();

    logger.info(`Vaccination record added for incident ${incidentId}, dose ${dose}`);

    return incident;
  } catch (error) {
    logger.error('Error adding vaccination record:', error);
    throw error;
  }
};

/**
 * Get incident statistics
 */
export const getIncidentStatistics = async (filters: {
  city?: string;
  state?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  try {
    const query: any = {};

    if (filters.city) {
      query['location.city'] = filters.city;
    }
    if (filters.state) {
      query['location.state'] = filters.state;
    }
    if (filters.startDate || filters.endDate) {
      query.reportedAt = {};
      if (filters.startDate) {
        query.reportedAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.reportedAt.$lte = filters.endDate;
      }
    }

    const [
      totalIncidents,
      statusBreakdown,
      severityBreakdown,
      avgResponseTime,
    ] = await Promise.all([
      Incident.countDocuments(query),
      Incident.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Incident.aggregate([
        { $match: query },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      Incident.aggregate([
        { $match: { ...query, assignedAt: { $exists: true } } },
        {
          $project: {
            responseTime: {
              $divide: [
                { $subtract: ['$assignedAt', '$reportedAt'] },
                1000 * 60, // Convert to minutes
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' },
          },
        },
      ]),
    ]);

    return {
      totalIncidents,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      severityBreakdown: severityBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
    };
  } catch (error) {
    logger.error('Error fetching statistics:', error);
    throw new Error('Failed to fetch statistics');
  }
};
