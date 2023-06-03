import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { config } from '../config/config';
import { statusCodes, statusMessages } from '../library/statusCodes';
import { RequestWithInterfaces, DecodedUser } from '../library/Interfaces.lib';

import { userGetOne } from '../models/User.model';
import { courierGetOne } from '../models/courier.model';

import Logging from '../library/Logging';

export const checkAuthorization = (courierCanAccess: boolean) => {
    return (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (!token) {
                Logging.error('Invalid or undefined token.', false);

                throw new Error('Invalid or undefined token.');
            }

            jwt.verify(token, config.secret.jwtSecret, (err, user) => {
                if (err) {
                    throw new Error('Invalid or expired token.');
                }
                req.user = <DecodedUser>user;
                if (req.user.role === 'courier' && !courierCanAccess) {
                    throw new Error('Invalid permission.');
                } else if (req.user.role === 'courier') {
                    const courier = courierGetOne({ shopName: req.user.shopName, email: req.user.email });
                    if (!courier) {
                        throw new Error('Something wrong at line 33');
                    }
                }
                if (req.user.role === 'user') {
                    const user = userGetOne({ shopName: req.user.shopName, email: req.user.email });
                    if (!user) {
                        throw new Error('Something wrong at line 39');
                    }
                }
                next();
            });
        } catch (error) {
            Logging.error(error, true);

            return res.status(statusCodes.Unauthorized).json({ message: error });
        }
    };
};

// const ip = <string>req.headers['x-forwarded-for'] || <string>req.socket.remoteAddress || '';
// const realIp = ip.split(',')[0];
