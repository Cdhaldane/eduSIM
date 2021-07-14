import { Router } from 'express';
const adminaccount = require('../controllers/login.jsx');
const router = Router();

//Routes go here

<<<<<<< HEAD

// API Path to get a specific admin


=======
// API Path to get a specific admin
// Request should have an admin
>>>>>>> editpage_v2
// Just one get method -> admin by email
router.get('/getAdminbyEmail/:email/:name', adminaccount.getAdminbyEmail);

export default router;
