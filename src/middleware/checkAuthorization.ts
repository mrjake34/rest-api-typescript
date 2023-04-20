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
            if (typeof req === 'undefined' || typeof next === 'undefined') {
                Logging.error('Unauthorized', false);

                return res.status(statusCodes.Unauthorized).json({
                    message: statusMessages.Unauthorized
                });
            }
            if (req.cookies && req.cookies.client_session) {
                const token = req.cookies.client_session;
                if (token && typeof token === 'string') {
                    jwt.verify(token, config.secret.jwtSecret, (err, user) => {
                        if (err) {
                            Logging.error('Unauthorized', false);

                            return res.status(statusCodes.Unauthorized).json({
                                message: statusMessages.Unauthorized
                            });
                        }
                        req.user = <DecodedUser>user;
                        if (req.user.role === 'courier' && !courierCanAccess) {
                            Logging.error('Unauthorized', false);

                            return res.status(statusCodes.Unauthorized).json({ message: statusMessages.Unauthorized });
                        } else if (req.user.role === 'courier') {
                            const courier = courierGetOne({ shopName: req.user.shopName, email: req.user.email });
                            if (!courier) {
                                Logging.error('Unauthorized', false);

                                return res.status(statusCodes.Unauthorized).json({
                                    message: statusMessages.Unauthorized
                                });
                            }
                        }
                        if (req.user.role === 'user') {
                            const user = userGetOne({ shopName: req.user.shopName, email: req.user.email });
                            if (!user) {
                                Logging.error('Unauthorized', false);

                                return res.status(statusCodes.Unauthorized).json({
                                    message: statusMessages.Unauthorized
                                });
                            }
                        }

                        next();
                    });
                }
            } else {
                Logging.error('Unauthorized', false);

                return res.status(statusCodes.Unauthorized).json({ message: statusMessages.Unauthorized });
            }
        } catch (error) {
            Logging.error(error, true);

            return res.status(statusCodes.Unauthorized).json({ message: statusMessages.Unauthorized });
        }
    };
};

// const ip = <string>req.headers['x-forwarded-for'] || <string>req.socket.remoteAddress || '';
// const realIp = ip.split(',')[0];
