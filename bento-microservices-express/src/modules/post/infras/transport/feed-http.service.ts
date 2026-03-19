import { pagingDTOSchema } from '@shared/model';
import { paginatedResponse } from '@shared/utils/utils';
import { Request, Response } from 'express';
import { IFeedUsecase } from '../../usecase/feed.usecase';

export class FeedHttpService {
  constructor(private readonly usecase: IFeedUsecase) {}

  async getTrendingPostsAPI(req: Request, res: Response) {
    const paging = pagingDTOSchema.parse(req.query);
    const posts = await this.usecase.getTrendingPosts(paging);
    paginatedResponse(posts, {}, res);
  }

  async getLatestPostsByTopicAPI(req: Request, res: Response) {
    const { topicId } = req.params;
    const paging = pagingDTOSchema.parse(req.query);
    const posts = await this.usecase.getLatestPostsByTopic(topicId, paging);
    paginatedResponse(posts, {}, res);
  }
}
