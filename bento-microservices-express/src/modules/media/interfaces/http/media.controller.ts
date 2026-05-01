import { Request, Response } from 'express';
import { fail, ok } from '../../../../infrastructure/http/response';
import { UploadMediaUseCase } from '../../application/use-cases/upload-media.usecase';

export class MediaController {
  public constructor(private readonly uploadMediaUseCase: UploadMediaUseCase) {}

  public upload = async (req: Request, res: Response): Promise<void> => {
    const file = req.file;
    if (!file) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: 'file is required'
      });
      return;
    }

    const uploaded = await this.uploadMediaUseCase.execute({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer
    });

    ok(res, uploaded, 201);
  };
}
