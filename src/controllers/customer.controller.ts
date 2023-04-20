import { NextFunction, Response } from 'express';

import Logging from '../library/Logging';

import { statusCodes, statusMessages } from '../library/statusCodes';

import { RequestWithInterfaces } from '../library/Interfaces.lib';

import { CustomerProps } from '../library/types.lib';

import {
    getCustomerByValues,
    getCustomersByValues,
    createCustomer as createFunction,
    updateCustomer as updateFunction,
    deleteCustomer as deleteFunction,
    ICustomerModel
} from '../models/customer.model';

export const createCustomer = async (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
    try {
        const { name, phone, adress, longitude, latitude } = req.body;

        if (!req.user || typeof name !== 'string' || typeof phone !== 'string' || typeof adress !== 'string' || typeof longitude !== 'number' || typeof latitude !== 'number') {
            Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
        }

        const shopName = req.user.shopName;

        const createdCustomer = await createFunction({
            shopName,
            name,
            phone,
            adress,
            longitude,
            latitude
        });
        Logging.info(statusMessages.CreateSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.CreateSuccess, customer: createCustomer }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const updateCustomer = async (req: RequestWithInterfaces, res: Response) => {
    try {
        const customerId = req.params.customerId;
        if (!req.user || !customerId) {
            Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
        }

        const customer = await getCustomerByValues({ _id: customerId, shopName: req.user.shopName });

        if (!customer || customer.shopName !== req.user.shopName) {
            Logging.error(statusMessages.CustomerNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CustomerNotFound });
        }

        const props = req.body;
        const updateOpts: Partial<ICustomerModel> = {};
        const allowedProps = ['name', 'phone', 'adress', 'longitude', 'latitude', 'orders'];

        for (const key in props) {
            if (props.hasOwnProperty(key)) {
                const newData = props[key] as CustomerProps;
                const { propName, value } = newData;
                if (propName === 'orders' && typeof value === 'string' && typeof customer.orders !== 'undefined') {
                    customer.orders.push(value);
                }
                // else if (propName === 'orders' && typeof value === 'string' && typeof customer.orders === 'undefined'){

                // }

                if (allowedProps.includes(propName)) {
                    updateOpts[propName as keyof ICustomerModel] = value;
                }

                const updatedCustomer = await updateFunction(customerId, updateOpts);
                Logging.info(statusMessages.UpdateSuccess, false);
                return res.status(statusCodes.Ok).json({ message: statusMessages.UpdateSuccess, customer: updatedCustomer }).end();
            } else {
                Logging.info(statusMessages.UpdateFailed, false);
                return res.status(statusCodes.Ok).json({ message: statusMessages.UpdateFailed }).end();
            }
        }
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const deleteCustomer = async (req: RequestWithInterfaces, res: Response) => {
    try {
        const customerId = req.params.customerId;
        if (!req.user || !customerId) {
            Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
        }

        const customer = await getCustomerByValues({ _id: customerId, shopName: req.user.shopName });

        if (!customer || customer.shopName !== req.user.shopName) {
            Logging.error(statusMessages.CustomerNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CustomerNotFound });
        }

        const deletedCustomer = await deleteFunction(customerId);
        if (deletedCustomer) {
            return res.status(statusCodes.Ok).json({ message: statusMessages.DeleteSuccess }).end();
        } else {
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.DeleteFailed }).end();
        }
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const getCustomers = async (req: RequestWithInterfaces, res: Response) => {
    try {
        if (!req.user) {
            Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
        }

        const customers = await getCustomersByValues({ shopName: req.user.shopName });

        if (!customers) {
            Logging.error(statusMessages.CustomerNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CustomerNotFound });
        }
        Logging.info(statusMessages.ListSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.ListSuccess, customers: customers }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const getCustomerDetails = async (req: RequestWithInterfaces, res: Response) => {
    try {
        const customerId = req.params.customerId;
        if (!req.user || !customerId) {
            Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
        }

        const customer = await getCustomerByValues({ _id: customerId, shopName: req.user.shopName });

        if (!customer || customer.shopName !== req.user.shopName) {
            Logging.error(statusMessages.CustomerNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.CustomerNotFound });
        }

        Logging.info(statusMessages.DetailsSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.ListSuccess, customer: customer }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};
