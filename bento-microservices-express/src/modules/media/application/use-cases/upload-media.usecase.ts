import { IMediaStorage, UploadedMedia, UploadMediaInput } from '../../domain/interfaces/media-storage.interface';

const IMAGE_LIMIT = 10 * 1024 * 1024;
const AUDIO_LIMIT = 20 * 1024 * 1024;
const VIDEO_LIMIT = 100 * 1024 * 1024;
const DOCUMENT_LIMIT = 20 * 1024 * 1024;

const ALLOWED_PREFIXES = ['image/', 'video/', 'audio/'] as const;
const ALLOWED_MIME_TYPES = new Set<string>([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

export class UploadMediaUseCase {
  public constructor(private readonly mediaStorage: IMediaStorage) {}

  public async execute(input: UploadMediaInput): Promise<UploadedMedia> {
    this.validate(input);
    return this.mediaStorage.upload(input);
  }

  private validate(input: UploadMediaInput): void {
    const isAllowedPrefix = ALLOWED_PREFIXES.some((prefix) => input.mimeType.startsWith(prefix));
    const isAllowedType = isAllowedPrefix || ALLOWED_MIME_TYPES.has(input.mimeType);
    if (!isAllowedType) {
      throw new Error('File type is not allowed');
    }

    const limit = this.resolveSizeLimit(input.mimeType);
    if (input.size > limit) {
      throw new Error('File exceeds size limit');
    }
  }

  private resolveSizeLimit(mimeType: string): number {
    if (mimeType.startsWith('image/')) {
      return IMAGE_LIMIT;
    }
    if (mimeType.startsWith('audio/')) {
      return AUDIO_LIMIT;
    }
    if (mimeType.startsWith('video/')) {
      return VIDEO_LIMIT;
    }
    return DOCUMENT_LIMIT;
  }
}
