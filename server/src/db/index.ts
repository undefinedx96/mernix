import mongoose from 'mongoose';
import { DB_NAME } from '../constants.ts';
import conf from '../conf/conf.ts';

const connectDB = async ():Promise<void> => {
    try {
        const connectionInstance = await mongoose.connect(`${conf.mongoDBUri}/${DB_NAME}`);
        console.log(`MongoDB connected! DB Host: ${connectionInstance.connection.host}`);
    }
    catch (error) {
        console.error(`MONGODB CONNECTION FAILED: ${error}`);
        process.exit(1);
    }
};

export default connectDB;