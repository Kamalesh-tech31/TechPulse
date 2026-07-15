import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import onboardingRoutes from './routes/onboarding.routes';

const app = express();

app.use(express.json());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP in dev to let Vite hot-reload & WebSocket channels mount safely
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting to prevent brute force attacks (max 200 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register routers
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/onboarding', onboardingRoutes);

export default app;
