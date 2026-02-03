import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { catchAsync } from '../utils/catch.async';

export const register = catchAsync(async (req: Request, res: Response) => {
    const { token } = await authService.register(req.body);

    res.status(201).json({
        status: 'success',
        token
    });
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const { token } = await authService.login(req.body);

    res.status(200).json({
        status: 'success',
        token
    });
});

export const getAllUsers = catchAsync(async (req: any, res: Response) => {
    const users = await authService.getAllUsers(req.user.id);

    res.status(200).json({
        status: 'success',
        data: { users }
    });
});