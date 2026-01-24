// import type { NextFunction, Request, Response } from "express";

// const asyncHandler = (requestHandlerFn: (req: Request, res: Response, next: NextFunction) => Promise<void> | Promise<unknown> | void) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         Promise
//         .resolve(requestHandlerFn(req, res, next))
//         .catch((err) => next(err))
//     }
// };

// export { asyncHandler };



// ================ OR BETTER TO IMPORT 'RequestHandler' TYPE DIRECTLY FROM EXPRESS ================

import type { RequestHandler } from 'express'

const asyncHandler = (requestHandlerFn: RequestHandler): RequestHandler => {
    return (req, res, next) => {
        Promise
        .resolve(requestHandlerFn(req, res, next))
        .catch((err) => next(err))
    }
};

export { asyncHandler };