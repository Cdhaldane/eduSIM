
import { Router } from 'express';
const adminaccount = require('../controllers/login.jsx');
const router = Router();

//Routes go here

<<<<<<< HEAD
// API Path to get a specific admin
// Request should have an admin
=======
>>>>>>> b529ada54d18fc84242bf30206391695610ff3af
// Just one get method -> admin by email
router.get('/getAdminbyEmail/:email/:name', adminaccount.getAdminbyEmail);

export default router;
