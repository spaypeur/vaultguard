export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'premium';
  tier: 'free' | 'premium' | 'enterprise';
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  preferences?: {
    notifications?: boolean;
    twoFactorEnabled?: boolean;
    theme?: 'light' | 'dark';
  };
}