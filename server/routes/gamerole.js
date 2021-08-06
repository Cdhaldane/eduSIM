import { Router } from 'express';
const gamerole = require('../controllers/roles.jsx');
const router = Router();

router.get('/getGameRoles/:gameinstanceid', gamerole.getGameRoles);

router.post('/createRole', gamerole.createRole);

export default router;
