import { Router } from 'express';
const game = require('../controllers/adminpage.jsx');
const router = Router();

//Routes go here

router.get('/getGames', game.getGames);

router.get('/getGameParameters/:id', game.getGameParameters);

router.post('/createGames', game.createGame);

export default router;