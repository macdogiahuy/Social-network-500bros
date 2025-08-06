import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { container } from 'tsyringe';
import { UserController } from './user.controller';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000000);
    cb(null, `${timestamp}-${randomId}${path.extname(file.originalname)}`);
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

const router = Router();
const userController = container.resolve(UserController);

router.get('/profile', async (req, res, next) => {
  try {
    await userController.getProfile(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    await userController.updateProfile(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/profile/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    await userController.updateAvatar(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
