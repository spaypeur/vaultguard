import { doubleCsrf } from 'csrf-csrf';
import { Request } from 'express';

const csrfConfig = {
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-min-32-chars-long',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
  },
  getSessionIdentifier: (req: Request) => req.cookies?.sessionId || 'default-session',
};

const csrf = doubleCsrf(csrfConfig);

export default csrf;