import test from 'node:test';
import assert from 'node:assert/strict';
import {
  IMediaStorage,
  UploadedMedia
} from '../modules/media/domain/interfaces/media-storage.interface';
import { UploadMediaUseCase } from '../modules/media/application/use-cases/upload-media.usecase';

class FakeMediaStorage implements IMediaStorage {
  public async upload(file: {
    originalName: string;
    mimeType: string;
    size: number;
    buffer: Buffer;
  }): Promise<UploadedMedia> {
    return {
      url: `https://cdn.example/${file.originalName}`,
      contentType: file.mimeType,
      size: file.size,
      filename: file.originalName,
      resourceType: 'image'
    };
  }
}

test('upload media accepts valid image', async () => {
  const useCase = new UploadMediaUseCase(new FakeMediaStorage());
  const uploaded = await useCase.execute({
    originalName: 'avatar.png',
    mimeType: 'image/png',
    size: 1024,
    buffer: Buffer.from('x')
  });
  assert.equal(uploaded.filename, 'avatar.png');
});

test('upload media rejects invalid mime type', async () => {
  const useCase = new UploadMediaUseCase(new FakeMediaStorage());
  await assert.rejects(
    async () =>
      useCase.execute({
        originalName: 'script.sh',
        mimeType: 'text/x-shellscript',
        size: 1024,
        buffer: Buffer.from('x')
      }),
    /File type is not allowed/
  );
});
