import mongoose, { Document, Schema } from 'mongoose';

export type IncidentStatus = 'reported' | 'assigned' | 'in_treatment' | 'treated' | 'closed';
export type SeverityLevel = 'minor' | 'moderate' | 'severe' | 'critical';

export interface IIncident extends Document {
  reporterId: mongoose.Types.ObjectId;
  reporterName: string;
  reporterPhone?: string; // Optional since users might not have phone numbers
  reporterEmail: string;
  
  // Incident details
  incidentDate: Date;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
    city: string;
    state: string;
    pincode?: string;
  };
  
  description: string;
  severity: SeverityLevel;
  victimAge?: number;
  victimGender?: 'male' | 'female' | 'other';
  
  // Dog details
  dogDescription?: string;
  dogColor?: string;
  dogSize?: 'small' | 'medium' | 'large';
  isStray: boolean;
  dogOwnerInfo?: string;
  
  // Media
  photos: string[]; // URLs to uploaded photos
  
  // Status tracking
  status: IncidentStatus;
  assignedHospitalId?: mongoose.Types.ObjectId;
  assignedHospitalName?: string;
  assignedStaffId?: mongoose.Types.ObjectId;
  assignedStaffName?: string;
  
  // Treatment tracking
  firstAidGiven: boolean;
  hospitalVisited: boolean;
  vaccineAdministered: boolean;
  vaccinationSchedule?: {
    dose: number;
    date: Date;
    completed: boolean;
  }[];
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  notes: string[];
  
  // Animal control
  animalControlNotified: boolean;
  animalControlResponse?: string;
  dogCaptured: boolean;
  
  // Timestamps
  reportedAt: Date;
  assignedAt?: Date;
  treatedAt?: Date;
  closedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema = new Schema<IIncident>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reporterName: {
      type: String,
      required: true,
      trim: true,
    },
    reporterPhone: {
      type: String,
      trim: true,
      default: '', // Make it optional with empty string default
    },
    reporterEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    
    // Incident details
    incidentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function(v: number[]) {
            return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
          },
          message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.',
        },
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
    },
    
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'critical'],
      required: true,
      default: 'moderate',
      index: true,
    },
    victimAge: {
      type: Number,
      min: 0,
      max: 150,
    },
    victimGender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    
    // Dog details
    dogDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    dogColor: {
      type: String,
      trim: true,
    },
    dogSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
    },
    isStray: {
      type: Boolean,
      required: true,
      default: true,
    },
    dogOwnerInfo: {
      type: String,
      trim: true,
    },
    
    // Media
    photos: {
      type: [String],
      default: [],
    },
    
    // Status tracking
    status: {
      type: String,
      enum: ['reported', 'assigned', 'in_treatment', 'treated', 'closed'],
      default: 'reported',
      required: true,
      index: true,
    },
    assignedHospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      index: true,
    },
    assignedHospitalName: {
      type: String,
      trim: true,
    },
    assignedStaffId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedStaffName: {
      type: String,
      trim: true,
    },
    
    // Treatment tracking
    firstAidGiven: {
      type: Boolean,
      default: false,
    },
    hospitalVisited: {
      type: Boolean,
      default: false,
    },
    vaccineAdministered: {
      type: Boolean,
      default: false,
    },
    vaccinationSchedule: [{
      dose: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    }],
    
    // Follow-up
    followUpRequired: {
      type: Boolean,
      default: true,
    },
    followUpDate: {
      type: Date,
    },
    notes: {
      type: [String],
      default: [],
    },
    
    // Animal control
    animalControlNotified: {
      type: Boolean,
      default: false,
    },
    animalControlResponse: {
      type: String,
      trim: true,
    },
    dogCaptured: {
      type: Boolean,
      default: false,
    },
    
    // Timestamps
    reportedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    assignedAt: {
      type: Date,
    },
    treatedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location-based queries
IncidentSchema.index({ 'location.coordinates': '2dsphere' });

// Compound indexes for common queries
IncidentSchema.index({ status: 1, reportedAt: -1 });
IncidentSchema.index({ reporterId: 1, reportedAt: -1 });
IncidentSchema.index({ assignedHospitalId: 1, status: 1 });
IncidentSchema.index({ 'location.city': 1, status: 1 });
IncidentSchema.index({ severity: 1, status: 1 });

// Pre-save middleware to update timestamps
IncidentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    if (this.status === 'assigned' && !this.assignedAt) {
      this.assignedAt = now;
    } else if (this.status === 'treated' && !this.treatedAt) {
      this.treatedAt = now;
    } else if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = now;
    }
  }
  next();
});

// Virtual for response time (in minutes)
IncidentSchema.virtual('responseTime').get(function() {
  if (this.assignedAt && this.reportedAt) {
    return Math.round((this.assignedAt.getTime() - this.reportedAt.getTime()) / (1000 * 60));
  }
  return null;
});

// Virtual for treatment time (in minutes)
IncidentSchema.virtual('treatmentTime').get(function() {
  if (this.treatedAt && this.assignedAt) {
    return Math.round((this.treatedAt.getTime() - this.assignedAt.getTime()) / (1000 * 60));
  }
  return null;
});

export default mongoose.model<IIncident>('Incident', IncidentSchema);
