import { Router } from 'express';
const gameinstance = require('../controllers/adminpage.jsx');
const router = Router();

//Routes go here

router.get('/:id', gameinstance.getGameInstances);

router.get('/getGameInstance/:adminid/:gameid', gameinstance.getGameInstance);

router.post('/createGameInstance', gameinstance.createGameInstance);

router.put('/update/:id', gameinstance.updateGameInstance);

export default router;