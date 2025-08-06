import { config } from '@shared/components/config';
import { AppError } from '@shared/utils/error';
import { Request, Response } from 'express';
import fs from 'fs';

const ErrImageTooBig = AppError.from(new Error('image too big, max size is 5MB'), 400);
const ErrMediaNotFound = AppError.from(new Error('media not found'), 400);
const ErrInvalidFileType = AppError.from(new Error('invalid file type, only images are allowed'), 400);

export class MediaHttpService {
  constructor() {}

  async uploadMediaAPI(req: Request, res: Response) {
    const file = req.file as Express.Multer.File;
    if (!file) {
      throw ErrMediaNotFound;
    }

    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      fs.unlinkSync(file.path);
      throw ErrInvalidFileType;
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(file.path);
      throw ErrImageTooBig;
    }

    const fileUploaded = {
      filename: file.originalname,
      url: `${config.upload.cdn}/${file.filename}`,
      ext: file.originalname.split('.').pop() || '',
      contentType: file.mimetype,
      size: file.size,
      file: file.buffer
    };

    res.status(200).json({ data: fileUploaded });
  }
}
