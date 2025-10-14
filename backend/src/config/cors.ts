import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',      // Vite dev server
      'http://localhost:3000',      // Alternative dev port
      'http://localhost:4173',      // Vite preview
      'http://localhost',           // Local testing
      'http://127.0.0.1:5173',     // Local IPv4
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4173',
      undefined,                    // Same-origin requests
    ];
    
    console.log('CORS request from origin:', origin);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Client-Version',
    'X-Device-ID',
    'X-Session-ID',
    'X-Timestamp',
    'x-csrf-token',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Per-Page',
    'X-Next-Page',
    'X-Prev-Page',
  ],
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
};

export default corsConfig;
