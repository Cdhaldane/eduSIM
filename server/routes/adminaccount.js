import { Router } from 'express';
const adminaccount = require('../controllers/login.jsx');
const router = Router();

//Routes go here

// Just one get method -> admin by email
router.get('/getAdminbyEmail/:email/:name', adminaccount.getAdminbyEmail);

export default router;
