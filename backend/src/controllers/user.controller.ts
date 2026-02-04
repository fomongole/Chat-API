import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { catchAsync } from '../utils/catch.async';

/**
 * Updates the user's profile (Image, About, Privacy).
 * This is a hybrid controller. It updates the DB via REST,
 * but ALSO triggers a Socket broadcast to ensure immediate UI updates
 * for other users viewing this profile.
 */
export const updateProfile = catchAsync(async (req: any, res: Response) => {
    // req.file contains the image, req.body contains text fields
    const updatedUser = await userService.updateProfile(req.user.id, req.body, req.file);

    // Retrieve the socket instance set in server.ts
    const io = req.app.get('io');

    // Real-time Update: Inform all clients about the profile change.
    // This allows the "Private" status or "Profile Image" to update
    // on other users' screens without them needing to refresh.
    io.emit("user_update", {
        userId: updatedUser.id,
        username: updatedUser.username,
        image: updatedUser.image,
        isPrivate: updatedUser.isPrivate,
        // If they went private, clear the 'about' field in the broadcast
        about: updatedUser.isPrivate ? null : updatedUser.about
    });

    res.status(200).json({
        status: 'success',
        data: { user: updatedUser }
    });
});

/**
 * Fetches the "Sidebar" list.
 * This is NOT a raw "get all users".
 * It runs complex logic to prioritize Active Conversations.
 */
export const getUsers = catchAsync(async (req: any, res: Response) => {
    const users = await userService.getSidebarUsers(req.user.id);

    res.status(200).json({
        status: 'success',
        data: { users }
    });
});

/**
 * Global Search for finding users in the sidebar.
 */
export const searchUsers = catchAsync(async (req: any, res: Response) => {
    const query = req.query.q as string;

    if (!query) {
        return res.status(200).json({ status: 'success', data: { users: [] } });
    }

    const users = await userService.searchUsers(query, req.user.id);

    res.status(200).json({
        status: 'success',
        data: { users }
    });
});