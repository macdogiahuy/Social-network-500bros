import multer from 'multer';
import { Router } from 'express';
import { MediaController } from './media.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

export const buildMediaRouter = (controller: MediaController): Router => {
  const router = Router();
  router.post('/media/upload', upload.single('file'), controller.upload);
  return router;
};
