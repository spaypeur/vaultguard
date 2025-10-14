import { Request, Response, NextFunction } from 'express';

const sanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    const sanitizeValue = (value: any): any => {
      if (typeof value === 'string') {
        return value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }
      if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      }
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).reduce((acc: any, key) => {
          acc[key] = sanitizeValue(value[key]);
          return acc;
        }, {});
      }
      return value;
    };

    req.body = sanitizeValue(req.body);
  }
  next();
};

export default sanitizer;