import { Router } from 'express';
import { uploadImageOnly } from '@shared/services/file-upload.service';
import { MediaHttpService } from './infra/transport/http-service';

export const setupMediaModule = () => {
  const httpService = new MediaHttpService();
  const router = Router();

  router.post('/upload-file', uploadImageOnly.single('file'), async (req, res, next) => {
    try {
      await httpService.uploadMediaAPI(req, res);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
