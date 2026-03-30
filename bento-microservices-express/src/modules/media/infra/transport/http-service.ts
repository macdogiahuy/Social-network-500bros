import { uploadBufferToCloudinary } from '@shared/services/cloudinary.service';
import { AppError } from '@shared/utils/error';
import { Request, Response } from 'express';

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
      throw ErrInvalidFileType;
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw ErrImageTooBig;
    }

    const uploaded = await uploadBufferToCloudinary(file, {
      folder: 'social-network-500bros/media',
      resourceType: 'image'
    });

    const fileUploaded = {
      filename: file.originalname,
      url: uploaded.secureUrl,
      ext: file.originalname.split('.').pop() || '',
      contentType: file.mimetype,
      size: file.size
    };

    res.status(200).json({ data: fileUploaded });
  }
}
