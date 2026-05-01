import { Router } from 'express';
import { BookmarkController } from './bookmark.controller';

export const buildBookmarkRouter = (controller: BookmarkController): Router => {
  const router = Router();
  router.post('/bookmarks', controller.save);
  router.delete('/bookmarks/:postId', controller.unsave);
  router.get('/bookmarks', controller.list);
  return router;
};
