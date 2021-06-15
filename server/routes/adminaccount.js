import { Router } from 'express';
const adminaccount = require('../controllers/login.jsx');
const router = Router();

//Routes go here

// API Path to get a specific admin
// Request should have an admin
router.get('/getAdminbyId/:id', adminaccount.getAdminbyId);

//API Path to create a new admin
router.post('/createAdmin', adminaccount.createAdmin);

export default router;
