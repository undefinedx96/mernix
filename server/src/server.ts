import conf from "./conf/conf.ts";
import connectDB from "./db/index.ts";
import { app } from './app.ts'

const PORT = conf.port || 3000;

connectDB()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`Bun server is running at http://127.0.0.1:${PORT}`);
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