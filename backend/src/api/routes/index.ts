import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import deliveryRoutes from './delivery.routes';
import vehicleRoutes from './vehicle.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';
import driverRoutes from './driver.routes';
import trackingRoutes from './tracking.routes';

const router = Router();

// Routes publiques
router.use('/auth', authRoutes);
router.use('/tracking', trackingRoutes);

// Routes protégées
router.use('/users', userRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/driver', driverRoutes);

export default router;
