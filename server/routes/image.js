import { Router } from 'express';
import { v2 } from 'cloudinary';

const router = Router();

router.post('/upload', async (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const file = req.files.file;

  // convert to data url and upload

  try {
    const uri = `data:${file.mimetype};base64,${file.data.toString('base64')}`;

    let uploadRes = await v2.uploader.upload(uri, { 
      folder: req.body.folder,
      metadata: {
        f7kmfvmsisj7khgan4nn: req.body.uploader
      }
    });

    res.status(200).send(uploadRes);
  } catch (err) { return res.status(500).send(err); }
});

router.get('/getImagesFrom/:uploader', async (req, res) => {
  try {
    let images = await v2.search
      .expression(`folder=images AND metadata.f7kmfvmsisj7khgan4nn=${req.params.uploader}`)
      .sort_by('created_at','desc')
      .max_results(5)
      .execute()

    res.status(200).send(images);
  } catch (err) { return res.status(500).send(err); }
});


export default router;
