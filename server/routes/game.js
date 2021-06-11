import { Router } from 'express';
const game = require('../controllers/adminpage.jsx');
const router = Router();

//Routes go here

// API Path to get all games of 'active' status
router.get('/getGames', game.getGames);

// API Path to get a specific game
// Request should have a game id
router.get('/getGamebyId/:id', game.getGamebyId);

//API Path to create a new game
router.post('/createGames', game.createGame);

export default router;