import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/send-otp', AuthController.sendOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/login', AuthController.login);
router.post('/google', AuthController.google);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/logout', AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);

export default router;
