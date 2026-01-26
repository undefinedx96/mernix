import { User } from '../models/user.model.ts'

declare global {
    namespace Express {
        interface Request {
            user?: InstanceType<typeof User>;
        }
    }
}