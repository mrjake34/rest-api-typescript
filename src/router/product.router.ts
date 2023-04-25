import express from 'express';

import * as ProductController from '../controllers/Product.controller';
import { checkAuthorization } from '../middleware/checkAuthorization';
import { RequestWithInterfaces, DecodedUser } from '../library/Interfaces.lib';
import { NextFunction, Response } from 'express';

export default (router: express.Router) => {
    router.get('/products/all', checkAuthorization(false), ProductController.test);

    router.post('/products', checkAuthorization(false), ProductController.createProduct);

    router.get('/products', checkAuthorization(false), ProductController.getProducts);

    router.get('/products/:productId', checkAuthorization(true), ProductController.getProductDetail);

    router.patch('/products/:productId', checkAuthorization(false), ProductController.updateProduct);

    router.delete('/products/:productId', checkAuthorization(false), ProductController.deleteProduct);
};
