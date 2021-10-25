import { Router } from 'express';
const gamerole = require('../controllers/roles');
const router = Router();

router.get('/getGameRoles/:gameinstanceid', gamerole.getGameRoles);

router.post('/createRole', gamerole.createRole);

router.delete('/deleteRole/:gameroleid', gamerole.deleteRole);

router.put('/update', gamerole.updateRole);

router.post('/copy', gamerole.copyRole);

export default router;
