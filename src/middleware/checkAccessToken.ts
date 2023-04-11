// import jwt from 'jsonwebtoken';
// import { NextFunction, Response } from 'express';
// import { config } from '../config/config';
// import { statusCodes, statusMessages } from '../library/statusCodes';
// import { RequestWithInterfaces, DecodedUser } from '../library/Interfaces.lib';

// export const checkAuthentication = (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
//     try {
//         if (req.cookies && req.cookies.client_session) {
//             const token = req.cookies.client_session;
//             if (token && typeof token === 'string') {
//                 jwt.verify(token, config.secret.jwtSecret, (err, user) => {
//                     if (err) {
//                         return res.status(statusCodes.Unauthorized).json({
//                             message: statusMessages.Unauthorized
//                         });
//                     }
//                     req.user = <DecodedUser>user;
//                     next();
//                 });
//             }
//         } else {
//             return res.status(statusCodes.Unauthorized).json({ message: statusMessages.Unauthorized });
//         }
//     } catch (error) {
//         return res.status(statusCodes.Unauthorized).json({ message: statusMessages.Unauthorized });
//     }
// };

// // const ip = <string>req.headers['x-forwarded-for'] || <string>req.socket.remoteAddress || '';
// // const realIp = ip.split(',')[0];
