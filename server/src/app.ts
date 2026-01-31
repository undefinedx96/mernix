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
    userRouter,
} from './routes/index.ts'


app.use('/api/v1/users', userRouter);

export { app }