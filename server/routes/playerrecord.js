import { Router } from 'express';
const playerrecord = require('../controllers/joinpage.jsx');
const router = Router();

router.post('/createPlayer', playerrecord.createPlayer);

router.post('/createRoom', playerrecord.createRoom);

router.delete('/deletePlayers', playerrecord.deletePlayers);

router.delete('/deleteRoom', playerrecord.deleteRoom);

router.get('/getRooms/:gameinstanceid', playerrecord.getRooms);

router.get('/getPlayers/:game_room', playerrecord.getPlayers);

export default router;
