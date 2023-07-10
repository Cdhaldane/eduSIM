import { Router } from 'express';
const gameinstance = require('../controllers/gamepage');
const gameroom = require('../controllers/joinpage');
const router = Router();

// Routes go here

// API Path to get all the game instances that a specific admin has created
// Request should have an admin id
router.get('/getGameInstances/:id', gameinstance.getGameInstances);

// API path to get a specific game instance that an admin has created
// Request should have an admin and a gameinstance id
router.get('/getGameInstance/:adminid/:gameid', gameinstance.getGameInstance);

router.get('/getAllGameInstances', gameinstance.getAllGameInstances);

// API Path to create a new game instance
router.post('/createGameInstance', gameinstance.createGameInstance);

//API Path to update a specific game instance
router.put('/update/:id', gameinstance.updateGameInstance);

// API Path to update a specific game instance
router.put('/delete/:id', gameinstance.deleteGameInstance);

// router.post('/revokeGameInstanceAccess', gameinstance.revokeGameInstanceAccess)

// router.get('/getCollaborators/:gameinstanceid', gameinstance.getCollaborators)

// router.get('/getRunningGameLog/:gameroomid', gameroom.getRunningGameLog)

// router.get('/getRunningSimulationLogs/:gameinstanceid', gameroom.getRunningSimulationLogs)

// router.put('/delete/:id', gameinstance.deleteGameInstance);
export default router;
