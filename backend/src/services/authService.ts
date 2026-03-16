import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User';
import { generateToken } from './tokenService';
import { sendPasswordResetEmail, sendWelcomeEmail } from './emailService';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'citizen' | 'hospital' | 'animal_control' | 'ngo' | 'authority';
  phone?: string;
  organization?: string;
  jurisdiction?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterData) => {
  // Trim and sanitize inputs
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const password = data.password;
  const role = data.role || 'citizen';
  const phone = data.phone?.trim();
  const organization = data.organization?.trim();
  const jurisdiction = data.jurisdiction?.trim();

  // Check if user already exists (generic error for security)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Registration failed. Please try again.');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with role
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    phone,
    organization,
    jurisdiction,
    isEmailVerified: false,
    // isVerified will be set by pre-save hook (auto-true for citizens)
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(email, name).catch((error) => {
    // Silently fail for welcome emails - don't block registration
    logger.debug('Failed to send welcome email:', error);
  });

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      organization: user.organization,
      jurisdiction: user.jurisdiction,
      isEmailVerified: user.isEmailVerified,
      isVerified: user.isVerified,
    },
    token,
  };
};

export const loginUser = async (data: LoginData) => {
  // Trim and sanitize inputs
  const email = data.email.trim().toLowerCase();
  const password = data.password;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user has password (Google OAuth users might not)
  if (!user.password) {
    throw new Error('Please sign in with Google or set a password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      organization: user.organization,
      jurisdiction: user.jurisdiction,
      isEmailVerified: user.isEmailVerified,
      isVerified: user.isVerified,
    },
    token,
  };
};

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
    token,
  };
};

export const forgotPassword = async (email: string) => {
  // Trim and sanitize email
  const sanitizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: sanitizedEmail });
  if (!user) {
    // Don't reveal if user exists for security
    return { message: 'If an account exists, a password reset email has been sent' };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + (config.resetTokenExpiry || 3600000)); // Use config or default 1 hour

  // Hash the token before storing (security best practice)
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = resetTokenExpiry;
  await user.save();

  // Send reset email with the original (unhashed) token (non-blocking)
  // Return immediately to avoid timeout - email will be sent in background
  sendPasswordResetEmail(sanitizedEmail, resetToken).catch((error) => {
    logger.error('Failed to send password reset email:', error);
    // Don't throw - email sending failure shouldn't block the response
  });

  return { message: 'If an account exists, a password reset email has been sent' };
};

export const resetPassword = async (token: string, newPassword: string) => {
  // Hash the provided token to compare with stored hashed token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update user
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // Generate token
  const authToken = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      organization: user.organization,
      jurisdiction: user.jurisdiction,
      isEmailVerified: user.isEmailVerified,
      isVerified: user.isVerified,
    },
    token: authToken,
  };
};

export const findOrCreateGoogleUser = async (
  googleId: string,
  email: string,
  name: string
) => {
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    // Update Google ID if not set
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    // Create new user
    user = await User.create({
      name,
      email,
      googleId,
      isEmailVerified: true, // Google emails are verified
    });
  }

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
    token,
  };
};

