import { NextFunction, Response } from 'express';

import Logging from '../library/Logging';
import { config } from '../config/config';
import { statusCodes, statusMessages } from '../library/statusCodes';

import { RequestWithInterfaces, Product } from '../library/Interfaces.lib';
import { ProductProps } from '../library/types.lib';
import {
    getProductsByShopName,
    getProductById,
    createProduct as newProductCreate,
    updateProductById,
    deleteProductById,
    getProductsByShopNameAndName,
    getProductsByValues,
    IProductModel
} from '../models/Product.model';

export const createProduct = async (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
    try {
        const { name, price } = req.body;
        if (!name || !price || !req.user || typeof name !== 'string' || typeof price !== 'number') {
            Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
        }

        const shopName = req.user.shopName;

        const existingProductName = await getProductsByShopNameAndName(name, shopName);
        if (existingProductName) {
            Logging.error(statusMessages.ProductNameFailed, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.ProductNameFailed });
        }

        const product = await newProductCreate({
            name,
            shopName,
            price
        });

        Logging.info(statusMessages.CreateSuccess + ' for email:' + req.user.email + ' for shopName:' + shopName, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.CreateSuccess }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const getProducts = async (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            Logging.error(statusMessages.UserNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.UserNotFound });
        }
        const products = await getProductsByShopName(req.user.shopName);
        if (!products) {
            Logging.error(statusMessages.ProductNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.ProductNotFound });
        }
        Logging.info(statusMessages.ListSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.ListSuccess, products: products }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const getProductDetail = async (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.params.productId) {
            Logging.error(statusMessages.UserNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.UserNotFound });
        }
        const product = await getProductById(req.params.productId, req.user.shopName);
        if (!product) {
            Logging.error(statusMessages.ProductNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.ProductNotFound });
        }
        Logging.info(statusMessages.DetailsSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.DetailsSuccess, product: product }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const updateProduct = async (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.params.productId) {
            Logging.error(statusMessages.UserNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.UserNotFound });
        }
        const product = await getProductById(req.params.productId, req.user.shopName);
        if (!product || product.shopName !== req.user.shopName) {
            Logging.error(statusMessages.ProductNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.ProductNotFound });
        }
        const props = req.body;
        const updateOpts: Partial<IProductModel> = {};
        const allowedProps = ['name', 'price'];
        for (const key in props) {
            if (props.hasOwnProperty(key)) {
                const newData = props[key] as ProductProps;
                const { propName, value } = newData;
                if (propName === 'name' && typeof value === 'string') {
                    if (value === product.name) {
                        Logging.error(statusMessages.ProductNameFailed, false);
                        return res.status(statusCodes.BadRequest).json({ message: statusMessages.ProductNameFailed });
                    }
                } else if (propName === 'name' && typeof value !== 'string') {
                    Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
                    return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
                }
                if (propName === 'price' && typeof value !== 'number') {
                    Logging.error(statusMessages.InputsNotFilledOrTypesWrong, false);
                    return res.status(statusCodes.BadRequest).json({ message: statusMessages.InputsNotFilledOrTypesWrong });
                }
                if (allowedProps.includes(propName)) {
                    updateOpts[propName as keyof IProductModel] = value;
                }
            }
        }
        const updatedProduct = await updateProductById(req.params.productId, updateOpts);
        Logging.info(statusMessages.UpdateSuccess, false);
        return res.status(statusCodes.Ok).json({ message: statusMessages.UpdateSuccess }).end();
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const deleteProduct = async (req: RequestWithInterfaces, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.params.productId) {
            Logging.error(statusMessages.UserNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.UserNotFound });
        }
        const product = await getProductById(req.params.productId, req.user.shopName);
        if (!product || product.shopName !== req.user.shopName) {
            Logging.error(statusMessages.ProductNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.ProductNotFound });
        }

        const deletedProduct = await deleteProductById(req.params.productId);
        if (deletedProduct) {
            Logging.info(statusMessages.DeleteSuccess, false);

            return res.status(statusCodes.Ok).json({ message: statusMessages.DeleteSuccess }).end();
        } else {
            Logging.info(statusMessages.DeleteFailed, false);

            return res.status(statusCodes.BadRequest).json({ message: statusMessages.DeleteFailed }).end();
        }
    } catch (error) {
        Logging.error(error, true);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};

export const test = async (req: RequestWithInterfaces, res: Response) => {
    try {
        const { name } = req.body;
        if (!req.user || !name) {
            Logging.error(statusMessages.UserNotFound, false);
            return res.status(statusCodes.BadRequest).json({ message: statusMessages.UserNotFound });
        }
        const data: Product = {
            shopName: req.user.shopName,
            price: 30
        };
        console.log(data);
        const product = await getProductsByValues(data);
        return res.status(statusCodes.Ok).json({ message: statusMessages.DetailsSuccess, products: product });
    } catch (error) {
        Logging.error(statusMessages.UserNotFound, false);
        return res.status(statusCodes.BadRequest).json({ message: error });
    }
};
