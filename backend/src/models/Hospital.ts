import mongoose, { Document, Schema } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  registrationNumber: string;
  
  // Contact information
  phone: string;
  email: string;
  website?: string;
  
  // Location
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  
  // Hospital details
  type: 'government' | 'private' | 'ngo' | 'clinic';
  specialization: string[];
  
  // Operating hours
  operatingHours: {
    day: string;
    open: string;
    close: string;
    is24x7: boolean;
  }[];
  
  // Vaccine availability
  vaccineInventory: {
    vaccineType: string;
    quantity: number;
    expiryDate: Date;
    lastUpdated: Date;
  }[];
  hasAntiRabiesVaccine: boolean;
  
  // Staff
  staffMembers: mongoose.Types.ObjectId[]; // References to User with role 'hospital'
  emergencyContact: {
    name: string;
    phone: string;
    designation: string;
  };
  
  // Capacity
  bedCapacity?: number;
  emergencyBeds?: number;
  
  // Verification
  isVerified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  
  // Status
  isActive: boolean;
  acceptingPatients: boolean;
  
  // Statistics
  totalIncidentsHandled: number;
  averageResponseTime?: number; // in minutes
  
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    
    // Contact information
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    
    // Location
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
          message: 'Invalid coordinates',
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
        required: true,
        trim: true,
      },
    },
    
    // Hospital details
    type: {
      type: String,
      enum: ['government', 'private', 'ngo', 'clinic'],
      required: true,
      index: true,
    },
    specialization: {
      type: [String],
      default: [],
    },
    
    // Operating hours
    operatingHours: [{
      day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      open: {
        type: String,
        required: true,
      },
      close: {
        type: String,
        required: true,
      },
      is24x7: {
        type: Boolean,
        default: false,
      },
    }],
    
    // Vaccine availability
    vaccineInventory: [{
      vaccineType: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
      expiryDate: {
        type: Date,
        required: true,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    }],
    hasAntiRabiesVaccine: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    // Staff
    staffMembers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    emergencyContact: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      designation: {
        type: String,
        required: true,
        trim: true,
      },
    },
    
    // Capacity
    bedCapacity: {
      type: Number,
      min: 0,
    },
    emergencyBeds: {
      type: Number,
      min: 0,
    },
    
    // Verification
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    acceptingPatients: {
      type: Boolean,
      default: true,
      index: true,
    },
    
    // Statistics
    totalIncidentsHandled: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageResponseTime: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location-based queries
HospitalSchema.index({ 'location.coordinates': '2dsphere' });

// Compound indexes
HospitalSchema.index({ isActive: 1, hasAntiRabiesVaccine: 1 });
HospitalSchema.index({ 'location.city': 1, isActive: 1 });

// Pre-save middleware to update vaccine availability flag
HospitalSchema.pre('save', function(next) {
  if (this.isModified('vaccineInventory')) {
    const now = new Date();
    this.hasAntiRabiesVaccine = this.vaccineInventory.some(
      vaccine => 
        vaccine.vaccineType.toLowerCase().includes('rabies') && 
        vaccine.quantity > 0 && 
        vaccine.expiryDate > now
    );
  }
  next();
});

export default mongoose.model<IHospital>('Hospital', HospitalSchema);
