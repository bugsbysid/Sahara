/**
 * Validates password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 */
const validatePasswordStrength = (password: string): string[] => {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^a-zA-Z\d]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }

  return errors;
};

export const validateRegister = (data: {
  name?: string;
  email?: string;
  password?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Trim inputs for validation
  const name = data.name?.trim();
  const email = data.email?.trim();

  if (!name || name.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (data.password) {
    errors.push(...validatePasswordStrength(data.password));
  } else {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateLogin = (data: {
  email?: string;
  password?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Trim email for validation
  const email = data.email?.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateResetPassword = (data: {
  password?: string;
  token?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.token) {
    errors.push('Reset token is required');
  }

  if (data.password) {
    errors.push(...validatePasswordStrength(data.password));
  } else {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateForgotPassword = (data: {
  email?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Trim email for validation
  const email = data.email?.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

