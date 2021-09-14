import { Router } from 'express';
const gameinstance = require('../controllers/gamepage');

const router = Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

// Routes go here

// API Path to get all the game instances that a specific admin has created
// Request should have an admin id
router.get('/:id', gameinstance.getGameInstances);

// API path to get a specific game instance that an admin has created
// Request should have an admin and a gameinstance id
router.get('/getGameInstance/:adminid/:gameid', gameinstance.getGameInstance);

// API Path to create a new game instance
router.post('/createGameInstance', gameinstance.createGameInstance);

// router.post('/upload', gameinstance.upload);

router.post('/upload', (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const file = req.files.file;

  file.mv(`${__dirname}../../../client/public/uploads/${file.name}`, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
  });
});

// API Path to update a specific game instance
router.put('/update/:id', gameinstance.updateGameInstance);

// API Path to update a specific game instance
router.put('/delete/:id', gameinstance.deleteGameInstance);

// router.put('/delete/:id', gameinstance.deleteGameInstance);
export default router;
