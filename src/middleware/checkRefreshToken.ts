import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { RequestWithInterfaces, DecodedUser } from '../library/Interfaces.lib';
import { config } from '../config/config';
import { statusCodes, statusMessages } from '../library/statusCodes';
import { getRefreshTokenById } from '../models/User.model';
import { getCourierRefreshTokenById } from '../models/courier.model';
import Logging from '../library/Logging';

export const checkRefresh = async (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
        const userRole = req.body.userRole;
        console.log(userId, userRole);
        if (!userId || !userRole) {
            return res.status(statusCodes.Unauthorized).json({
                message: 'Unauthorized'
            });
        }
        let user;
        if (userRole === 'user') {
            user = await getRefreshTokenById(userId);
        } else if (userRole === 'courier') {
            user = await getCourierRefreshTokenById(userId);
        } else {
            return res.status(statusCodes.Unauthorized).json({
                message: 'Unauthorized'
            });
        }

        if (!user || typeof user.refreshToken === 'undefined') {
            return res.status(statusCodes.Unauthorized).json({
                message: 'Unauthorized'
            });
        }

        let data = {
            Id: user._id,
            shopName: user.shopName,
            role: user.role
        };

        const refreshToken = user.refreshToken;
        if (!refreshToken || typeof refreshToken !== 'string') {
            return res.status(statusCodes.Unauthorized).json({
                message: 'Unauthorized'
            });
        }
        jwt.verify(refreshToken, config.secret.jwtSecret, (err, user) => {
            if (err) {
                Logging.error('Unauthorized', false);

                return res.status(statusCodes.Unauthorized).json({
                    message: statusMessages.Unauthorized
                });
            }

            const accessToken = jwt.sign(data, config.secret.jwtSecret, {
                expiresIn: '15m'
            });

            res.cookie('client_session', accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: 3600000 //1 hour
            });

            req.user = <DecodedUser>user;
            next();
        });
    } catch (error) {
        return res.status(statusCodes.Unauthorized).json({
            message: error
        });
    }
};
