import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { RequestWithInterfaces, DecodedUser } from '../library/Interfaces.lib';
import { config } from '../config/config';
import { statusCodes } from '../library/statusCodes';
import { getRefreshTokenById } from '../models/User.model';
import { getCourierRefreshTokenById } from '../models/courier.model';

export const checkRefresh = async (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
        if (!userId || !req.user) {
            return res.status(statusCodes.Unauthorized).json({
                message: 'Unauthorized'
            });
        }
        let user;
        if (req.user.role === 'user') {
            user = await getRefreshTokenById(userId);
        } else if (req.user.role === 'courier') {
            user = await getCourierRefreshTokenById(userId);
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
        if (!refreshToken) {
            return res.status(statusCodes.Unauthorized).json({
                message: 'Unauthorized'
            });
        }

        jwt.verify(refreshToken, config.secret.jwtSecret, async (err, user) => {
            if (err) {
                return res.status(statusCodes.Unauthorized).json({
                    message: 'Unauthorized'
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
