export type UploadMediaInput = {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
};

export type UploadedMedia = {
  url: string;
  contentType: string;
  size: number;
  filename: string;
  resourceType: string;
};

export interface IMediaStorage {
  upload(file: UploadMediaInput): Promise<UploadedMedia>;
}
