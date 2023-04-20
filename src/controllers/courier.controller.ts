import { NextFunction, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import Logging from '../library/Logging';
import { statusCodes, statusMessages } from '../library/statusCodes';
import { config } from '../config/config';

import { RequestWithInterfaces, Courier } from '../library/Interfaces.lib';
import { CourierProps } from '../library/types.lib';
import { courierGetOne, courierGetById, courierGetAll, courierCreate, courierUpdate, courierDelete, ICourierModel } from '../models/courier.model';

export const createCourier = async (req: RequestWithInterfaces, res: Response) => {
    try {
        //get values from request body and check their types
        const { name, phone, email, password } = req.body;
        const user = req.user;
        if (!name || !phone || !email || !password || !user) {
            Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
        }

        if (typeof name !== 'string' || typeof phone !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
        }

        //check courier is existing
        const existingCourierPhone = await courierGetOne({ phone });
        const existingCourierEmail = await courierGetOne({ email });

        if (existingCourierPhone || existingCourierEmail) {
            Logging.error(statusMessages.PhoneOrEmailFailed, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.PhoneOrEmailFailed });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const courier: Courier = { shopName: user.shopName, name: name, phone: phone, email: email, password: hashedPassword };

        const createdCourier = await courierCreate(courier);

        if (!createdCourier) {
            Logging.info(statusMessages.RegisterFailed, false);
            return res.status(statusCodes.Ok).json({ Message: statusMessages.RegisterFailed }).end();
        }
        Logging.info(statusMessages.RegisterSuccess + ' for shopName:' + user.shopName, false);
        return res.status(statusCodes.Ok).json({ Message: statusMessages.RegisterSuccess, courier: createdCourier }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const courierLogin = async (req: RequestWithInterfaces, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
        }

        const courier = await courierGetOne({ email });
        if (!courier || !courier.password) {
            Logging.error(statusMessages.CourierNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CourierNotFound });
        }

        const canLogin = await bcrypt.compare(password, courier.password);

        if (!canLogin) {
            Logging.error(statusMessages.LoginFailed, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.LoginFailed });
        }

        const ipCheck = <string>req.headers['x-forwarded-for'] || <string>req.socket.remoteAddress || '';
        const courierIp = ipCheck.split(',')[0];

        let data = {
            Id: courier._id,
            shopName: courier.shopName,
            role: courier.role
        };

        const accessToken = jwt.sign(data, config.secret.jwtSecret, {
            expiresIn: '15m'
        });

        const refreshToken = jwt.sign(data, config.secret.jwtSecret, {
            expiresIn: '7d'
        });

        res.cookie('client_session', accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3600000 //1 hour
        });

        courier.refreshToken = refreshToken;
        courier.ip = courierIp;

        courier
            .save()
            .then()
            .catch((err) => {
                Logging.warn('Failed to save courier ip or refreshToken', false);
            });
        Logging.info(courier.email + ' is logged in.', false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.LoginSuccess, Courier: data }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const updateCourier = async (req: RequestWithInterfaces, res: Response) => {
    try {
        if (!req.params.courierId || !req.user || typeof req.user === 'undefined') {
            Logging.error(statusMessages.InputsNotFilled, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilled });
        }

        const courierIdFromParams = req.params.courierId;

        const courier = await courierGetById(courierIdFromParams);
        if (!courier || req.user.shopName !== courier.shopName) {
            Logging.error(statusMessages.CourierNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CourierNotFound });
        }

        const props = req.body;
        const updateOpts: Partial<ICourierModel> = {};
        const allowedProps = ['name', 'phone', 'email', 'password'];
        for (const key in props) {
            if (props.hasOwnProperty(key)) {
                const newData = props[key] as CourierProps;
                const { propName, value } = newData;

                if (propName === 'phone') {
                    //check existing phone number in courier db
                    const existingPhone = await courierGetOne({ phone: value });

                    if (existingPhone) {
                        Logging.error(statusMessages.PhoneFailed, false);
                        return res.status(statusCodes.BadRequest).json({ message: statusMessages.PhoneFailed });
                    }
                }
                if (propName === 'email') {
                    const existingEmail = await courierGetOne({ email: value });
                    if (existingEmail) {
                        Logging.error(statusMessages.EmailFailed, false);
                        return res.status(statusCodes.BadRequest).json({ message: statusMessages.EmailFailed });
                    }
                }
                if ((propName === 'name' && typeof value === 'undefined') || (propName === 'password' && typeof value === 'undefined')) {
                    Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
                    return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
                }
                if (allowedProps.includes(propName)) {
                    updateOpts[propName as keyof ICourierModel] = value;
                }
            }
        }
        const updatedCourier = await courierUpdate(req.params.courierId, updateOpts);
        if (!updatedCourier) {
            Logging.info(statusMessages.UpdateFailed, false);
            return res.status(statusCodes.Ok).json({ message: statusMessages.UpdateFailed }).end();
        }
        Logging.info(statusMessages.UpdateSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.UpdateSuccess }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const deleteCourier = async (req: RequestWithInterfaces, res: Response) => {
    try {
        if (!req.user || !req.params.courierId) {
            Logging.error(statusMessages.CourierNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CourierNotFound });
        }

        const courier = await courierGetById(req.params.courierId);

        if (!courier || courier.shopName !== req.user.shopName) {
            Logging.error(statusMessages.CourierNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CourierNotFound });
        }

        const deletedCourier = await courierDelete(req.params.courierId);
        if (deletedCourier) {
            return res.status(statusCodes.Ok).json({ message: statusMessages.DeleteSuccess }).end();
        } else {
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.DeleteFailed }).end();
        }
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const getCouriers = async (req: RequestWithInterfaces, res: Response) => {
    try {
        if (!req.user) {
            Logging.error(statusMessages.CourierNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CourierNotFound });
        }

        const couriers = await courierGetAll({ shopName: req.user.shopName });

        if (!couriers) {
            Logging.error(statusMessages.CourierNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CourierNotFound });
        }
        Logging.info(statusMessages.ListSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.ListSuccess, couriers: couriers }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const getCourierDetails = async (req: RequestWithInterfaces, res: Response) => {
    try {
        const courierId = req.params.courierId;
        if (!req.user || !courierId) {
            Logging.error(statusMessages.CourierNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CourierNotFound });
        }
        const courier = await courierGetById(courierId);
        if (!courier) {
            Logging.error(statusMessages.CourierNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CourierNotFound });
        }
        Logging.info(statusMessages.ListSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.ListSuccess, courier: courier }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};
