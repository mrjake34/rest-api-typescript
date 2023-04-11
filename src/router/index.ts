import express from 'express';

import user from './user.router';
import refresh from './refresh.router';
import products from './product.router';
import couriers from './courier.router';
import orders from './order.router';
import customers from './customer.router';

const router = express.Router();

export default (): express.Router => {
    user(router);
    products(router);
    refresh(router);
    couriers(router);
    orders(router);
    customers(router);
    return router;
};
