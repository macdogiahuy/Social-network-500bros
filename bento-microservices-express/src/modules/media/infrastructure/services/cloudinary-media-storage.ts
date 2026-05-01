import { uploadBufferToCloudinary } from '../../../../shared/services/cloudinary.service';
import {
  IMediaStorage,
  UploadedMedia,
  UploadMediaInput
} from '../../domain/interfaces/media-storage.interface';

export class CloudinaryMediaStorage implements IMediaStorage {
  public async upload(file: UploadMediaInput): Promise<UploadedMedia> {
    const multerFile = {
      fieldname: 'file',
      originalname: file.originalName,
      encoding: '7bit',
      mimetype: file.mimeType,
      size: file.size,
      buffer: file.buffer
    } as Express.Multer.File;

    const uploaded = await uploadBufferToCloudinary(multerFile, {
      folder: 'social-network-500bros/media',
      resourceType: 'auto'
    });

    return {
      url: uploaded.secureUrl,
      contentType: file.mimeType,
      size: file.size,
      filename: file.originalName,
      resourceType: uploaded.resourceType
    };
  }
}
