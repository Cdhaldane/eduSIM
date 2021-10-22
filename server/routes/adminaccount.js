import { Router } from 'express';
const adminaccount = require('../controllers/login');
const { verifyCollaboratorStatus } = require('../controllers/gamepage');
const router = Router();

router.get('/getAdminbyEmail/:email/:name', adminaccount.getAdminbyEmail);

router.post('/verifyCollaborator', verifyCollaboratorStatus);

export default router;
