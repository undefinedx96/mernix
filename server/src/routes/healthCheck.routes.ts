import { Router } from 'express';
import { getHealthCheck } from '../controllers/healthCheck.controller.ts';

const healthCheckRouter = Router();

healthCheckRouter.route('/').get(getHealthCheck);

export default healthCheckRouter;