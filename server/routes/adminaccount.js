import { Router } from 'express';
const adminaccount = require('../controllers/login');
const { verifyCollaboratorStatus } = require('../controllers/gamepage');
const router = Router();

router.get('/getAdminbyEmail/:email/:name', adminaccount.getAdminbyEmail);

router.get('/getProfile/:param(email|adminid)?/:value', adminaccount.getProfile);

router.get('/getName/:adminid', adminaccount.getName);

router.post('/verifyCollaborator', verifyCollaboratorStatus);

router.put('/update/:email', adminaccount.updateProfile);

export default router;
