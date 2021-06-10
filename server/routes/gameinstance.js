import { Router } from 'express';
const gameinstance = require('../controllers/adminpage');
const router = Router();

//Routes go here


router.get('/:id', gameinstance.getGameInstance);

// router.post('/createUser', user.createUser);

// router.post('/delete', user.deleteUser);

// router.post('/update/:id', user.updateUser);

export default router;