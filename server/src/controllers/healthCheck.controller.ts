import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.ts'
import { ApiResponse } from '../utils/ApiResponse.ts'
import type { HealthCheckResponse } from '../types/types.ts'
import mongoose from 'mongoose'




const getHealthCheck = asyncHandler(async (req: Request, res: Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;

    const isHealthy = isDbConnected;
    const statusCode = isHealthy ? 200 : 503;
    const message = isHealthy ? 'System operational' : 'System Degraded';

    const healthData: HealthCheckResponse = {
        status: isHealthy ? 'OK' : 'DEGRADED',
        uptime: Math.floor(process.uptime()),
        timestamp: Date.now(),
        environment: process.env.NODE_ENV! || 'development',
        services: {
            database: isDbConnected ? 'HEALTHY' : 'UNHEALTHY'
        }
    };

    // console.table([
    //     {
    //         Property: 'Status Code',
    //         Value: statusCode
    //     },
    //     {
    //         Property: 'Health Status',
    //         Value: healthData.status
    //     },
    //     {
    //         Property: 'Message',
    //         Value: message
    //     },
    //     {
    //         Property: 'Database',
    //         Value: healthData.services.database
    //     },
    //     {
    //         Property: 'Uptime (s)',
    //         Value: healthData.uptime
    //     },
    //     {
    //         Property: 'Environment',
    //         Value: healthData.environment
    //     }
    // ]);

    return res
    .status(statusCode)
    .json(
        new ApiResponse(statusCode, healthData, message)
    );
});



export {
    getHealthCheck
}