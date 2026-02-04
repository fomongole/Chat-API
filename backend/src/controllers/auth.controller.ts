import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { catchAsync } from '../utils/catch.async';

export const register = catchAsync(async (req: Request, res: Response) => {
    // Destructure both token AND user from the service
    const { token, user } = await authService.register(req.body);

    res.status(201).json({
        status: 'success',
        token,
        data: { user } // Send the user back to the frontend
    });
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const { token, user } = await authService.login(req.body);

    res.status(200).json({
        status: 'success',
        token,
        data: { user }
    });
});