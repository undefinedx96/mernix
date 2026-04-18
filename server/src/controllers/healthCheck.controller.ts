import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import type { HealthCheckResponse } from '../types/types.ts';




const getHealthCheck = asyncHandler(async (req: Request, res: Response) => {

    const healthData: HealthCheckResponse = {
        status: 'OK',
        uptime: Math.floor(process.uptime()),
        timestamp: Date.now(),
        environment: process.env.NODE_ENV! || 'development',
    };
    // console.log('Health data: ', healthData);

    return res
    .status(200)
    .json(
        new ApiResponse(200, healthData, 'Health check passed')
    );
});



export {
    getHealthCheck
}