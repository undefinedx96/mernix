import conf from "./conf/conf.js";
import connectDB from "./db/index.js";
import { app } from './app.js'

const PORT = conf.port || 3000;

connectDB()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`Server is running at http://127.0.0.1:${PORT}`);
        });

        server.on('error', (err) => {
            console.error('SERVER ERROR: ', err);
            process.exit(1);
        })
    })
    .catch((err) => {
        console.error(`MONGODB CONNECTION FAILED!!: ${err}`);
        process.exit(1);
    });