import { NextFunction, Response } from 'express';

import { RequestWithInterfaces, orderProps } from '../library/Interfaces.lib';
import Logging from '../library/Logging';
import { statusCodes, statusMessages } from '../library/statusCodes';

import {
    OrderStatus,
    createOrder,
    updateOrder as updateOrderFunction,
    deleteOrder as deleteOrderFunction,
    getOrdersByValues,
    getOrderDetailByValues,
    OrderModel,
    getOrderDetailByValuesForCourier,
    Order
} from '../models/order.model';
import { getProductById } from '../models/Product.model';

export const createNewOrder = async (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
    try {
        const { customerId, products, orderNote } = req.body;

        if (!customerId || !products || !req.user) {
            Logging.error(statusMessages.InputsNotFilled, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilled });
        }
        const { shopName } = req.user;
        let totalPrice = 0;
        for (let index = 0; index < products.length; index++) {
            const element = products[index];
            const productId = element['productId'];
            const quantity = element['quantity'];

            if (typeof productId === 'string' && typeof quantity === 'number') {
                const product = await getProductById(productId, shopName);
                if (!product || !product.price) {
                    console.log(product);
                    Logging.error(statusMessages.InputsNotFilled, false);
                    return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilled });
                }
                totalPrice += quantity * product.price;
            } else {
                Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
                return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
            }
        }

        const newOrder = await createOrder({
            shopName,
            customerId,
            products,
            totalPrice,
            orderNote // may return undefined
        });

        Logging.info(statusMessages.CreateSuccess, false);

        return res.status(statusCodes.Ok).json({ message: statusMessages.CreateSuccess });
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const updateOrder = async (req: RequestWithInterfaces, res: Response) => {
    try {
        const orderId = req.params.orderId;
        if (!orderId || !req.user) {
            Logging.error(statusMessages.InputsNotFilled, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilled });
        }
        const order = await getOrderDetailByValues(orderId, req.user.shopName);
        if (!order) {
            Logging.error(statusMessages.OrderNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilled });
        }

        if (req.user.role === 'user') {
            const props = req.body;
            const updateOpts: Partial<OrderModel> = {};
            const allowedProps = ['customerId', 'products', 'orderStatus', 'courierId', 'orderNote'];
            const allowedStatus = ['waiting', 'inProcess', 'inDistribution', 'completed'];

            for (const key in props) {
                if (props.hasOwnProperty(key)) {
                    const newData = props[key] as orderProps;
                    const { propName, value } = newData;
                    if (propName === 'products') {
                        const { shopName } = req.user;
                        if (typeof value !== 'string' && typeof value !== 'number') {
                            let totalPrice = 0;
                            for (let index = 0; index < value.length; index++) {
                                const element = value[index];
                                const productId = element['productId'];
                                const quantity = element['quantity'];
                                if (typeof productId === 'string' && typeof quantity === 'number') {
                                    const product = await getProductById(productId, shopName);
                                    if (!product || !product.price) {
                                        Logging.error(statusMessages.InputsNotFilled, false);
                                        return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilled });
                                    }
                                    totalPrice += quantity * product.price;
                                } else {
                                    Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
                                    return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
                                }
                            }
                            if (totalPrice !== 0 || totalPrice !== order.totalPrice) {
                                updateOpts['totalPrice'] = totalPrice;
                            }
                        }
                    }
                    if (allowedProps.includes(propName)) {
                        if (propName === 'orderStatus') {
                            if (typeof value === 'string' && allowedStatus.includes(value)) {
                                updateOpts[propName as keyof OrderModel] = value;
                            } // else do nothing
                        } else {
                            updateOpts[propName as keyof OrderModel] = value;
                        }
                    }
                }
            }
            console.log(orderId, updateOpts);
            const updatedOrder = await updateOrderFunction(orderId, updateOpts);
            console.log(updatedOrder);
            Logging.info(statusMessages.UpdateSuccess, false);
            return res.status(statusCodes.Ok).json({ message: statusMessages.UpdateSuccess }).end();
        } else if (req.user.role === 'courier') {
            const props = req.body;
            const updateOpts: Partial<OrderModel> = {};
            const allowedProps = ['orderStatus'];
            const allowedStatus = ['waiting', 'inProcess', 'inDistribution', 'completed'];
            for (const key in props) {
                if (props.hasOwnProperty(key)) {
                    const newData = props[key] as orderProps;
                    const { propName, value } = newData;

                    if (allowedProps.includes(propName) && typeof value === 'string' && allowedStatus.includes(value)) {
                        updateOpts[propName as keyof OrderModel] = value;
                    } // else do nothing
                }
            }
            const updatedOrder = await updateOrderFunction(orderId, updateOpts);
            Logging.info(statusMessages.UpdateSuccess, false);
        } else {
            Logging.error(statusMessages.UpdateFailed, true);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.UpdateFailed });
        }
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const deleteOrder = async (req: RequestWithInterfaces, res: Response) => {
    try {
        if (!req.user || !req.params.orderId) {
            Logging.error(statusMessages.UserNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.UserNotFound });
        }
        const orderId = req.params.orderId;
        const order = await getOrderDetailByValues(orderId, req.user.shopName);
        if (!order) {
            Logging.error(statusMessages.OrderNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.OrderNotFound });
        }
        const deletedOrder = await deleteOrderFunction(orderId);
        if (deletedOrder) {
            Logging.info(statusMessages.DeleteSuccess, false);

            return res.status(statusCodes.Ok).json({ message: statusMessages.DeleteSuccess }).end();
        } else {
            Logging.error(statusMessages.DeleteFailed, false);

            return res.status(statusCodes.BadRequest).json({ message: statusMessages.DeleteFailed }).end();
        }
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const getAllOrders = async (req: RequestWithInterfaces, res: Response) => {
    try {
        if (!req.user) {
            Logging.error(statusMessages.UserNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.UserNotFound });
        }
        let orders;
        if (req.user.role === 'user') {
            orders = await getOrdersByValues({
                shopName: req.user.shopName
            });
        }
        if (req.user.role === 'courier') {
            orders = await getOrdersByValues({
                shopName: req.user.shopName,
                courierId: req.user.Id
            });
        }
        if (!orders) {
            Logging.info(statusMessages.OrderNotFound, false);
            return res.status(statusCodes.Ok).json({ message: statusMessages.OrderNotFound });
        }
        Logging.info(statusMessages.ListSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.DetailsSuccess, products: orders });
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const getOrderDetails = async (req: RequestWithInterfaces, res: Response) => {
    try {
        if (!req.user || !req.params.orderId) {
            Logging.error(statusMessages.UserNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.UserNotFound });
        }
        if (req.user.role === 'user') {
            const orders = await getOrderDetailByValues(req.params.orderId, req.user.shopName);
            if (orders) {
                Logging.info(statusMessages.DetailsSuccess, false);
                return res.status(statusCodes.Ok).json({ message: statusMessages.DetailsSuccess, products: orders });
            }
        } else if (req.user.role === 'courier') {
            const orders = await getOrderDetailByValuesForCourier(req.params.orderId, req.user.shopName, req.user.Id);
            if (orders) {
                Logging.info(statusMessages.DetailsSuccess, false);
                return res.status(statusCodes.Ok).json({ message: statusMessages.DetailsSuccess, products: orders });
            }
        }

        Logging.info(statusMessages.DetailsFailed, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.DetailsFailed });
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const getCourierOrders = async (req: RequestWithInterfaces, res: Response) => {
    try {
        if (!req.user) {
            Logging.error(statusMessages.UserNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.UserNotFound });
        }
        const orders = await getOrdersByValues({
            shopName: req.user.shopName,
            courierId: req.user.Id
        });
        if (!orders) {
            Logging.info(statusMessages.OrderNotFound, false);
            return res.status(statusCodes.Ok).json({ message: statusMessages.OrderNotFound });
        }
        Logging.info(statusMessages.ListSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.DetailsSuccess, products: orders });
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};
