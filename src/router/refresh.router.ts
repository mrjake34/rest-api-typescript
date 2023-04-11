import express from 'express';
import { refreshSuccess } from '../controllers/RefreshToken.controller';

import { checkRefresh } from '../middleware/checkRefreshToken';

export default (router: express.Router) => {
    router.post('/refresh/:userId', checkRefresh, refreshSuccess);
};
