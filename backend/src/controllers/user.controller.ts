import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { catchAsync } from '../utils/catch.async';

export const updateProfile = catchAsync(async (req: any, res: Response) => {
    // req.file contains the image, req.body contains text fields
    const updatedUser = await userService.updateProfile(req.user.id, req.body, req.file);

    res.status(200).json({
        status: 'success',
        data: { user: updatedUser }
    });
});