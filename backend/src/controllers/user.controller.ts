import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { catchAsync } from '../utils/catch.async';

export const updateProfile = catchAsync(async (req: any, res: Response) => {
    // req.file contains the image, req.body contains text fields
    const updatedUser = await userService.updateProfile(req.user.id, req.body, req.file);

    // Get the socket instance we attached in server.ts
    const io = req.app.get('io');

    // Real-time Update: Inform all clients about the profile change
    // This allows other users to see the "Private" status change without refreshing
    io.emit("user_update", {
        userId: updatedUser.id,
        username: updatedUser.username,
        image: updatedUser.image,
        isPrivate: updatedUser.isPrivate,
        // If the user just went private, we send null for 'about' to match our privacy service
        about: updatedUser.isPrivate ? null : updatedUser.about
    });

    res.status(200).json({
        status: 'success',
        data: { user: updatedUser }
    });
});

export const getUsers = catchAsync(async (req: any, res: Response) => {
    const users = await userService.getAllUsers(req.user.id);

    res.status(200).json({
        status: 'success',
        data: { users }
    });
});