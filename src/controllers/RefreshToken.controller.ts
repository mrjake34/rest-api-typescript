import { NextFunction, Response } from 'express';
import { RequestWithInterfaces } from '../library/Interfaces.lib';
import { statusCodes, statusMessages } from '../library/statusCodes';
import Logging from '../library/Logging';

export const refreshSuccess = async (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
    try {
        if (typeof req.user === 'undefined' || req.user === null) {
            return res.status(statusCodes.Unauthorized).json({
                message: 'Unauthorized'
            });
        }
        Logging.info(statusMessages.LoginSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.LoginSuccess, user: req.user }).end();
    } catch (error) {
        return res.status(statusCodes.Unauthorized).json({
            message: error
        });
    }
};
