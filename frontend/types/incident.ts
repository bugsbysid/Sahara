export type IncidentStatus = 'reported' | 'assigned' | 'in_treatment' | 'treated' | 'closed';
export type SeverityLevel = 'minor' | 'moderate' | 'severe' | 'critical';
export type DogSize = 'small' | 'medium' | 'large';
export type Gender = 'male' | 'female' | 'other';

export interface Location {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  city: string;
  state: string;
  pincode?: string;
}

export interface VaccinationRecord {
  dose: number;
  date: Date | string;
  completed: boolean;
}

export interface Incident {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  
  incidentDate: Date | string;
  location: Location;
  
  description: string;
  severity: SeverityLevel;
  victimAge?: number;
  victimGender?: Gender;
  
  dogDescription?: string;
  dogColor?: string;
  dogSize?: DogSize;
  isStray: boolean;
  dogOwnerInfo?: string;
  
  photos: string[];
  
  status: IncidentStatus;
  assignedHospitalId?: string;
  assignedHospitalName?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  
  firstAidGiven: boolean;
  hospitalVisited: boolean;
  vaccineAdministered: boolean;
  vaccinationSchedule?: VaccinationRecord[];
  
  followUpRequired: boolean;
  followUpDate?: Date | string;
  notes: string[];
  
  animalControlNotified: boolean;
  animalControlResponse?: string;
  dogCaptured: boolean;
  
  reportedAt: Date | string;
  assignedAt?: Date | string;
  treatedAt?: Date | string;
  closedAt?: Date | string;
  
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateIncidentData {
  incidentDate: Date | string;
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    pincode?: string;
  };
  description: string;
  severity: SeverityLevel;
  victimAge?: number;
  victimGender?: Gender;
  dogDescription?: string;
  dogColor?: string;
  dogSize?: DogSize;
  isStray: boolean;
  dogOwnerInfo?: string;
  photos?: string[];
}

export interface Hospital {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  type?: string;
  distance?: number;
  distanceKm?: string;
  hasVaccine: boolean;
  emergencyContact?: {
    name: string;
    phone: string;
    designation: string;
  };
}

export interface IncidentListResponse {
  incidents: Incident[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IncidentStatistics {
  totalIncidents: number;
  statusBreakdown: Record<string, number>;
  severityBreakdown: Record<string, number>;
  avgResponseTime: number;
}

export interface CreateIncidentResponse {
  message: string;
  incident: Partial<Incident>;
  nearbyHospitals: Hospital[];
}
