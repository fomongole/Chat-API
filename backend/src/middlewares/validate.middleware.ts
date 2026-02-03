import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { AppError } from '../utils/app.error';

export const validate = (schema: ZodTypeAny) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const firstError = error.issues[0];
                const message = firstError ? firstError.message : 'Invalid input';
                return next(new AppError(message, 400));
            }
            next(error);
        }
    };
