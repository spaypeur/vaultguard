import { Request } from 'express';
import { User } from './index';

export { User };
export interface AuthRequest extends Request {
  user?: User;
}