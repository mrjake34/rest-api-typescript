import express from 'express';

import * as OrderController from '../controllers/order.controller';
import { checkAuthorization } from '../middleware/checkAuthorization';

export default (router: express.Router) => {
    router.post('/orders', checkAuthorization(false), OrderController.createNewOrder);
    router.patch('/orders/:orderId', checkAuthorization(true), OrderController.updateOrder);
    router.get('/orders', checkAuthorization(true), OrderController.getAllOrders);
    router.get('/orders/:orderId', checkAuthorization(true), OrderController.getOrderDetails);
    router.delete('/orders/:orderId', checkAuthorization(false), OrderController.deleteOrder);
};
