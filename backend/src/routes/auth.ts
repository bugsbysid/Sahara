import { Router, Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from '../services/authService';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../validators/authValidator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';

const router = Router();

// Register
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const validation = validateRegister(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          errors: validation.errors,
        },
      });
    }

    const result = await registerUser(req.body);
    return res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(400).json({
      error: {
        message: err.message || 'Registration failed',
      },
    });
  }
});

// Login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          errors: validation.errors,
        },
      });
    }

    const result = await loginUser(req.body);
    return res.status(200).json({
      message: 'Login successful',
      ...result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(401).json({
      error: {
        message: err.message || 'Login failed',
      },
    });
  }
});

// Forgot Password
router.post('/forgot-password', passwordResetLimiter, async (req: Request, res: Response) => {
  try {
    const validation = validateForgotPassword(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          errors: validation.errors,
        },
      });
    }

    const result = await forgotPassword(req.body.email);
    return res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: {
        message: err.message || 'Failed to process request',
      },
    });
  }
});

// Reset Password
router.post('/reset-password', passwordResetLimiter, async (req: Request, res: Response) => {
  try {
    const validation = validateResetPassword(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          errors: validation.errors,
        },
      });
    }

    const result = await resetPassword(req.body.token, req.body.password);
    return res.status(200).json({
      message: 'Password reset successful',
      ...result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(400).json({
      error: {
        message: err.message || 'Password reset failed',
      },
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const User = (await import('../models/User')).default;
    const authReq = req as AuthRequest;
    
    if (!authReq.user?.userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
        },
      });
    }
    
    const user = await User.findById(authReq.user.userId);

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
        },
      });
    }

    return res.status(200).json({
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
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: {
        message: err.message || 'Failed to fetch user',
      },
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const User = (await import('../models/User')).default;
    const authReq = req as AuthRequest;
    
    if (!authReq.user?.userId) {
      return res.status(401).json({
        error: {
          message: 'User not authenticated',
        },
      });
    }

    const { name, email } = req.body;

    // Validate inputs
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Name must be at least 2 characters long',
        },
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        error: {
          message: 'Please provide a valid email address',
        },
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.trim().toLowerCase(),
        _id: { $ne: authReq.user.userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          error: {
            message: 'Email is already in use',
          },
        });
      }
    }

    // Update user
    const updateData: { name?: string; email?: string; isEmailVerified?: boolean } = {};
    if (name) updateData.name = name.trim();
    if (email) {
      updateData.email = email.trim().toLowerCase();
      // Reset email verification if email changed
      updateData.isEmailVerified = false;
    }

    const user = await User.findByIdAndUpdate(
      authReq.user.userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
        },
      });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
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
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: {
        message: err.message || 'Failed to update profile',
      },
    });
  }
});

export default router;

