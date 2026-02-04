import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Protect all routes in this file
router.use(protect);

router.put('/profile', upload.single('image'), userController.updateProfile);

router.get('/search', userController.searchUsers);

router.get('/', userController.getUsers);

export default router;