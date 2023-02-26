import { Router } from 'express';
const adminaccount = require('../controllers/login');
const { verifyCollaboratorStatus } = require('../controllers/gamepage');
const router = Router();

router.get('/getAdminbyEmail/:email/:name', adminaccount.getAdminbyEmail);

router.get('/getProfile/:email', adminaccount.getProfile);

router.post('/verifyCollaborator', verifyCollaboratorStatus);

router.put('/update/:email', adminaccount.updateProfile);

export default router;
