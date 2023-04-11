import express from 'express';

import * as CourierController from '../controllers/courier.controller';
import { checkAuthorization } from '../middleware/checkAuthorization';

export default (router: express.Router) => {
    router.post('/couriers', checkAuthorization(false), CourierController.createCourier);
    router.post('/couriers/login', CourierController.courierLogin);
    router.get('/couriers', checkAuthorization(false), CourierController.getCouriers);
    router.get('/couriers/:courierId', checkAuthorization(true), CourierController.getCourierDetails);
    router.patch('/couriers/:courierId', checkAuthorization(false), CourierController.deleteCourier);
    router.delete('/couriers/:courierId', checkAuthorization(false), CourierController.updateCourier);
};
