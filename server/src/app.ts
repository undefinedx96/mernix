import express from 'express';
import type { Application } from 'express'
import cors from 'cors';
import conf from './conf/conf.ts';
import cookieParser from 'cookie-parser';

const app: Application = express();

app.use(cors({
    origin: conf.corsOrigin,
    credentials: true
}));

app.use(express.json({limit: '16kb'}));

app.use(express.urlencoded({extended: true, limit: '16kb'}));

app.use(express.static('public'));

app.use(cookieParser());



import {
    commentRouter,
    dashboardRouter,
    healthCheckRouter,
    likeRouter,
    playlistRouter,
    subscriptionRouter,
    tweetRouter,
    userRouter,
    videoRouter,
} from './routes/index.ts'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'

const swaggerDocument = YAML.load('./swaggerDoc.yaml');


app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/tweets', tweetRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/playlists', playlistRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/healthcheck', healthCheckRouter);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export { app }