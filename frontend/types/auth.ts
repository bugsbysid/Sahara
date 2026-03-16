export type UserRole = 'citizen' | 'hospital' | 'animal_control' | 'ngo' | 'authority';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  jurisdiction?: string;
  isEmailVerified: boolean;
  isVerified: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  organization?: string;
  jurisdiction?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

