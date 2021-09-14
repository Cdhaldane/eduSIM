import { Router } from 'express';
const adminaccount = require('../controllers/login');
const router = Router();

router.get('/getAdminbyEmail/:email/:name', adminaccount.getAdminbyEmail);

export default router;
