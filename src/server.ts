import express from 'express';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import routes from './router';
import cookieParser from 'cookie-parser';
import { statusCodes } from './library/statusCodes';
import rateLimit from 'express-rate-limit';
import * as fs from 'fs';
import * as https from 'https';
import http from 'http';

const router = express();

// const options = {
//     key: fs.readFileSync('./src/helper/ssl/private.key'),
//     cert: fs.readFileSync('./src/helper/ssl/cert.pem')
// };

const Limiter = (minutes: number, limit: number) =>
    rateLimit({
        windowMs: minutes * 60 * 1000, // 1 minutes
        max: limit, // Limit each IP to 100 requests per `windowMs` (here, per 1 minutes)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false // Disable the `X-RateLimit-*` headers
    });

mongoose
    .connect(config.mongo.url)
    .then(() => {
        Logging.info('Connected to MongoDB', false);
        StartServer();
    })
    .catch((error) => {
        Logging.error('Unable to connect to MongoDB', false);
        Logging.error(error, true);
    });

/** Only start the server if the connection is established */
const StartServer = () => {
    router.use((req, res, next) => {
        const ip = <string>req.headers['x-forwarded-for'] || <string>req.socket.remoteAddress || '';
        const realIp = ip.split(',')[0];
        Logging.info(`Incoming -> Method: [${req.method}] - Url: ${req.url} - IP: [${realIp}]`, false);

        res.on('finish', () => {
            /** Log the Response */
            Logging.info(`Finish -> Method: [${req.method}] - Url: ${req.url} - IP: [${realIp}] - Status: [${res.statusCode} - ${res.statusMessage}]`, false);
        });

        next();
    });

    router.use(cookieParser());
    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    /** Request Limiters */
    router.use('/login', Limiter(1, 5));
    router.use('/signup', Limiter(1, 5));
    router.use('/refresh', Limiter(1, 5));

    router.use('/user', Limiter(1, 100));
    router.use('/products', Limiter(1, 100));
    router.use('/couriers', Limiter(1, 100));
    router.use('/orders', Limiter(1, 100));
    router.use('/customers', Limiter(1, 100));

    /** Rules of API */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*'); // izinleri düzenle
        res.header('Access-Control-Allow-Headers', 'Origin, set-cookie, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Expose-Headers', 'true');
        res.header('Access-Control-Allow-Credentials', 'true');
        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(statusCodes.Ok).json({});
        }
        next();
    });

    /** Routes */
    router.use('/', routes());

    /** Healtcheck */
    router.get('/ping', (req, res, next) => res.status(statusCodes.Ok).json({ message: 'pong' }));

    /** Error handling */
    router.use((req, res, next) => {
        const ip = <string>req.headers['x-forwarded-for'] || <string>req.socket.remoteAddress || '';
        const realIp = ip.split(',')[0];
        const error = new Error(`Page Not Found! - IP: [${realIp}]`);
        Logging.error(`Page Not Found! - IP: [${realIp}]`, true);

        return res.status(statusCodes.NotFound).json({ message: error.message });
    });

    http.createServer(router).listen(config.server.port, () => Logging.info('Server is runnging on port ' + config.server.port, false));
};
