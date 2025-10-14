import { Response } from 'express';
import { ApiResponse } from '../types';

// Eliminate 50+ duplicate response formatting patterns
export class ApiResponseHelper {

  static success<T = any>(
    res: Response,
    data: T,
    message: string = 'Success',
    status: number = 200
  ): void {
    const response: ApiResponse = {
      success: true,
      data,
      message
    };
    res.status(status).json(response);
  }

  static error(
    res: Response,
    error: string,
    message: string = 'An error occurred',
    status: number = 400
  ): void {
    const response: ApiResponse = {
      success: false,
      error,
      message
    };
    res.status(status).json(response);
  }

  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): void {
    this.error(res, 'not_found', message, 404);
  }

  static unauthorized(
    res: Response,
    message: string = 'Authentication required'
  ): void {
    this.error(res, 'unauthorized', message, 401);
  }

  static forbidden(
    res: Response,
    message: string = 'Access denied'
  ): void {
    this.error(res, 'forbidden', message, 403);
  }

  static validation(
    res: Response,
    details: string[],
    message: string = 'Validation failed'
  ): void {
    const response: any = {
      success: false,
      error: 'validation_error',
      message,
      details
    };
    res.status(400).json(response);
  }
}

// Replace all the duplicate try-catch patterns
export class ErrorHandler {
  static handle<T>(
    res: Response,
    operation: () => Promise<T>,
    errorMessage: string = 'Operation failed'
  ): Promise<T | null> {
    return (operation() as Promise<any>).catch((error: any): Promise<T | null> => {
      console.error(`${errorMessage}:`, error);
      ApiResponseHelper.error(res, error.message || errorMessage);
      return Promise.resolve(null);
    });
  }

  static handleAsync(
    operation: () => Promise<any>,
    defaultValue: any = null
  ): Promise<any> {
    return operation().catch((error: any) => {
      console.error('Async operation failed:', error);
      return defaultValue;
    });
  }
}
