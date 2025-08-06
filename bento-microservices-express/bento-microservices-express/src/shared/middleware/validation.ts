import { AppError } from '@shared/utils/error';
import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

/**
 * Creates middleware for validating request bodies against a Zod schema
 * @param schema The Zod schema to validate against
 * @returns An Express middleware function
 */
export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request body against the schema
      const validatedData = schema.parse(req.body);

      // Replace the request body with the validated data
      req.body = validatedData;

      next();
    } catch (error) {
      // Return validation errors
      if (error instanceof ZodError) {
        const validationError = new Error(`Validation error: ${error.message}`);
        next(AppError.from(validationError, 400));
      } else {
        next(AppError.from(new Error('Invalid request body'), 400));
      }
    }
  };
};

/**
 * Creates middleware for validating request query parameters against a Zod schema
 * @param schema The Zod schema to validate against
 * @returns An Express middleware function
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request query against the schema
      const validatedData = schema.parse(req.query);

      // Replace the request query with the validated data
      req.query = validatedData as any;

      next();
    } catch (error) {
      // Return validation errors
      if (error instanceof ZodError) {
        const validationError = new Error(`Validation error: ${error.message}`);
        next(AppError.from(validationError, 400));
      } else {
        next(AppError.from(new Error('Invalid query parameters'), 400));
      }
    }
  };
};

/**
 * Creates middleware for validating request parameters against a Zod schema
 * @param schema The Zod schema to validate against
 * @returns An Express middleware function
 */
export const validateParams = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request parameters against the schema
      const validatedData = schema.parse(req.params);

      // Replace the request parameters with the validated data
      req.params = validatedData as any;

      next();
    } catch (error) {
      // Return validation errors
      if (error instanceof ZodError) {
        const validationError = new Error(`Validation error: ${error.message}`);
        next(AppError.from(validationError, 400));
      } else {
        next(AppError.from(new Error('Invalid URL parameters'), 400));
      }
    }
  };
};
