import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import { MediaHttpService } from './infra/transport/http-service';

export const setupMediaModule = () => {
  const httpService = new MediaHttpService();
  const router = Router();

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = 'uploads';
      ensureDirectoryExistence(uploadPath);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const hrtime = process.hrtime();
      const prefix = `${hrtime[0] * 1e6}`;
      cb(null, `${prefix}_${file.originalname}`);
    }
  });

  const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check if file exists and is an image
    if (!file) {
      cb(new Error('No file uploaded'));
      return;
    }

    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only images are allowed'));
      return;
    }

    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  });

  router.post('/upload-file', upload.single('file'), async (req, res, next) => {
    try {
      await httpService.uploadMediaAPI(req, res);
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export const ensureDirectoryExistence = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};
