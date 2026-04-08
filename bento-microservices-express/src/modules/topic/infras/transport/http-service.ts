import { ITopicRepository } from '@modules/topic/interface/interface';
import { TopicUsecase } from '@modules/topic/usecase';
import { RedisCache } from '@shared/components/redis-cache';
import { MdlFactory } from '@shared/interface';
import { pagingDTOSchema } from '@shared/model';
import { ErrNotFound } from '@shared/utils/error';
import { pickParam } from '@shared/utils/request';
import { paginatedResponse, successResponse } from '@shared/utils/utils';
import { NextFunction, Request, Response, Router } from 'express';

export class TopicHttpService {
  constructor(
    private readonly usecase: TopicUsecase,
    private readonly topicRepo: ITopicRepository
  ) {}

  async createTopicAPI(req: Request, res: Response) {
    const data = await this.usecase.create(req.body);
    
    // Invalidate topic cache
    await RedisCache.getInstance().delPattern('topics:*');
    
    successResponse(data, res);
  }

  async updateTopicAPI(req: any, res: any) {
    const id = pickParam(req.params.id);
    const data = await this.usecase.update(id, req.body);
    
    // Invalidate topic cache
    await RedisCache.getInstance().delPattern('topics:*');
    
    successResponse(data, res);
  }

  async deleteTopicAPI(req: any, res: any) {
    const id = pickParam(req.params.id);
    const data = await this.usecase.delete(id);
    
    // Invalidate topic cache
    await RedisCache.getInstance().delPattern('topics:*');
    
    successResponse(data, res);
  }

  async listTopicsAPI(req: Request, res: Response) {
    const paging = pagingDTOSchema.parse(req.query);
    const dto = req.query;

    // Generate cache key
    const cacheKey = `topics:list:${paging.page}:${paging.limit}:${JSON.stringify(dto)}`;
    
    // Try cache first
    const cached = await RedisCache.getInstance().get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const data = await this.usecase.list(dto, paging);
    
    // Cache for 10 minutes
    await RedisCache.getInstance().set(cacheKey, data, 600);
    
    paginatedResponse(data, {}, res);
  }

  async searchTopicsAPI(req: Request, res: Response) {
    const paging = pagingDTOSchema.parse(req.query);
    const query = (req.query.q as string) || '';

    // Generate cache key
    const cacheKey = `topics:search:${query}:${paging.page}:${paging.limit}`;
    
    // Try cache first
    const cached = await RedisCache.getInstance().get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const data = await this.usecase.search(query, paging);
    
    // Cache for 5 minutes
    await RedisCache.getInstance().set(cacheKey, data, 300);
    
    paginatedResponse(data, {}, res);
  }

  // RPC APIs

  async listByIdsAPI(req: Request, res: Response) {
    const { ids } = req.body;
    const data = await this.topicRepo.findByIds(ids);

    res.status(200).json({ data });
  }

  async getByIdAPI(req: Request, res: Response, next: NextFunction) {
    const id = pickParam(req.params.id);
    const data = await this.topicRepo.findByIds([id]);

    if (data.length === 0) {
      next(ErrNotFound);
      return;
    }

    res.status(200).json({ data: data[0] });
  }

  getRoutes(mdlFactory: MdlFactory): Router {
    const router = Router();

    router.post('/topics', mdlFactory.auth, this.createTopicAPI.bind(this));
    router.patch('/topics/:id', mdlFactory.auth, this.updateTopicAPI.bind(this));
    router.delete('/topics/:id', mdlFactory.auth, this.deleteTopicAPI.bind(this));
    router.get('/topics', this.listTopicsAPI.bind(this) as any);
    router.get('/topics/search', this.searchTopicsAPI.bind(this) as any);

    // RPC APIs
    router.post('/rpc/topics/list-by-ids', this.listByIdsAPI.bind(this));
    router.get('/rpc/topics/:id', this.getByIdAPI.bind(this));

    return router;
  }
}
