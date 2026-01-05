import conf from "./conf/conf.js";
import connectDB from "./db/index.js";
import { app } from './app.js'

const PORT = conf.port || 3000;

connectDB()
    .then(() => {
        app.on('error', (error) => {
            console.error(`APP ERROR: ${error}`);
        })

        app.listen(conf.port || PORT, () => {
            console.log(`Server is running at http://127.0.0.1:${conf.port}`);
        })
    })
    .catch((err) => {
        console.error(`MONGODB CONNECTION FAILED!!: ${err}`);
    });