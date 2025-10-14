import { Request } from 'express';
import { User } from './database';

export interface AuthenticatedRequest extends Request {
  user?: User;
  cookies?: {
    refreshToken?: string;
    [key: string]: string | undefined;
  };
}