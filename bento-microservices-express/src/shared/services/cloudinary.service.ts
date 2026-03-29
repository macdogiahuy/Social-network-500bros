import { config } from '@shared/components/config';
import { AppError, ErrInvalidRequest } from '@shared/utils/error';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

let isConfigured = false;

function ensureCloudinaryConfigured() {
  if (isConfigured) return;

  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw AppError.from(
      new Error(
        'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
      ),
      500
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  isConfigured = true;
}

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  format?: string;
  originalFilename?: string;
};

export async function uploadBufferToCloudinary(
  file: Express.Multer.File,
  options?: {
    folder?: string;
    resourceType?: UploadApiOptions['resource_type'];
    publicId?: string;
  }
): Promise<CloudinaryUploadResult> {
  ensureCloudinaryConfigured();

  if (!file?.buffer) {
    throw ErrInvalidRequest.withMessage('No upload buffer found');
  }

  const folder =
    options?.folder ||
    `${config.cloudinary.baseFolder}/${resolveDefaultFolder(file.mimetype)}`;

  const uploadOptions: UploadApiOptions = {
    folder,
    resource_type: options?.resourceType || 'auto',
    public_id: options?.publicId
  };

  const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error || !result) {
        reject(error || new Error('Cloudinary upload failed'));
        return;
      }

      resolve(result);
    });

    stream.end(file.buffer);
  });

  return {
    secureUrl: uploaded.secure_url,
    publicId: uploaded.public_id,
    resourceType: uploaded.resource_type,
    bytes: uploaded.bytes,
    format: uploaded.format,
    originalFilename: uploaded.original_filename
  };
}

function resolveDefaultFolder(mimeType?: string) {
  if (!mimeType) return 'files';
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('video/')) return 'videos';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'files';
}
