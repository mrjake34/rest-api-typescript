import express from 'express';

import * as CustomerController from '../controllers/customer.controller';
import { checkAuthorization } from '../middleware/checkAuthorization';
import { RequestWithInterfaces, DecodedUser } from '../library/Interfaces.lib';
import { NextFunction, Response } from 'express';

export default (router: express.Router) => {
    router.post('/customers', checkAuthorization(false), CustomerController.createCustomer);
    router.patch('/customers/:customerId', checkAuthorization(false), CustomerController.updateCustomer);
    router.delete('/customers/:customerId', checkAuthorization(false), CustomerController.deleteCustomer);
    router.get('/customers', checkAuthorization(false), CustomerController.getCustomers);
    router.get('/customers/:customerId', checkAuthorization(true), CustomerController.getCustomerDetails);
};
