import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Protect all routes in this file
router.use(protect);

// Use 'upload.single' to handle one file named 'image'
router.put('/profile', upload.single('image'), userController.updateProfile);

export default router;