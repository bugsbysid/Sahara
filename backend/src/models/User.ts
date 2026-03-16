import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'citizen' | 'hospital' | 'animal_control' | 'ngo' | 'authority';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  organization?: string; // For hospital, NGO, animal control, authority
  jurisdiction?: string; // For animal control, authority
  isVerified: boolean; // For hospital, NGO, animal control, authority accounts
  googleId?: string;
  isEmailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['citizen', 'hospital', 'animal_control', 'ngo', 'authority'],
      default: 'citizen',
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
      // Required for non-citizen roles
    },
    jurisdiction: {
      type: String,
      trim: true,
      // For animal control and authority to specify their area
    },
    isVerified: {
      type: Boolean,
      default: false,
      // For hospital, NGO, animal control, authority - requires admin verification
      // Citizens are auto-verified
    },
    googleId: {
      type: String,
      sparse: true, // Allows multiple null values
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
UserSchema.index({ resetPasswordToken: 1 });
UserSchema.index({ resetPasswordExpires: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ jurisdiction: 1 });

// Pre-save hook to auto-verify citizens
UserSchema.pre('save', function(next) {
  if (this.isNew && this.role === 'citizen') {
    this.isVerified = true;
  }
  next();
});

export default mongoose.model<IUser>('User', UserSchema);

