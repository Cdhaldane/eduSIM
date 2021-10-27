import { Router } from 'express';
const playerrecord = require('../controllers/joinpage');
const router = Router();

router.post('/createGamePlayers', playerrecord.createGamePlayers);

router.post('/createPlayer', playerrecord.createPlayer);

router.post('/createRoom', playerrecord.createRoom);

router.delete('/deletePlayers/:gameplayerid', playerrecord.deletePlayers);

router.delete('/deleteRoom/:gameroomid', playerrecord.deleteRoom);

router.get('/getRooms/:gameinstanceid', playerrecord.getRooms);

router.get('/getRoomByURL', playerrecord.getRoomByURL);

router.get('/getRoomInteractionBreakdown', playerrecord.getRoomInteractionBreakdown);

router.get('/getPlayer', playerrecord.getPlayer);

router.get('/getPlayers/:game_room', playerrecord.getPlayers);

router.get('/getAllPlayers/:gameinstanceid', playerrecord.getAllPlayers);

router.put('/updatePlayer', playerrecord.updatePlayer);

router.get('/getGameLogs', playerrecord.getGameLogs);

router.post('/deleteGameLog', playerrecord.deleteGameLog);

export default router;
