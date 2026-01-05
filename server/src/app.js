import express from 'express';
import cors from 'cors';
import conf from './conf/conf.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: conf.corsOrigin,
    credentials: true
}));

app.use(express.json({limit: '16kb'}));

app.use(express.urlencoded({extended: true, limit: '16kb'}));

app.use(express.static('public'));

app.use(cookieParser());

export { app }