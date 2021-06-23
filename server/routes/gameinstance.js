import { Router } from 'express';
const gameinstance = require('../controllers/gamepage.jsx');
const router = Router();
const multer = require('multer');

const gameinstances = require('../models/GameInstances');

const upload = multer({dest: "uploads/"});
//Routes go here

// API Path to get all the game instances that a specific admin has created
// Request should have an admin id
router.get('/:id', gameinstance.getGameInstances);

// API path to get a specific game instance that an admin has created
// Request should have an admin and a gameinstance id
router.get('/getGameInstance/:adminid/:gameid', gameinstance.getGameInstance);

//API Path to create a new game instance
router.post('/createGameInstance', gameinstance.createGameInstance);

//API Path to upload image
router.post('/upload', gameinstance.upload);


//API Path to update a specific game instance
router.put('/update/:id', gameinstance.updateGameInstance);

//API Path to update a specific game instance

router.delete('/delete/:id', gameinstance.deleteGameInstance);

export default router;
