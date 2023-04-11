import express from 'express';

import * as UserController from '../controllers/User.controller';
import { checkAuthorization } from '../middleware/checkAuthorization';

export default (router: express.Router) => {
    router.post('/signup', UserController.register);
    router.post('/login', UserController.login);
    router.get('/user/:userId', checkAuthorization(false), UserController.getUserDetail);
    router.patch('/user/:userId', checkAuthorization(false), UserController.updateUser);
    router.delete('/user/:userId', checkAuthorization(false), UserController.deleteUser);
};
