import { IUseCase } from "@shared/interface";
import { pagingDTOSchema } from "@shared/model";
import { pickParam } from "@shared/utils/request";
import { Request, Response } from "express";

export abstract class BaseHttpService<Entity, CreateDTO, UpdateDTO, Cond> {
  constructor(readonly useCase: IUseCase<CreateDTO, UpdateDTO, Entity, Cond>) { }

  async createAPI(req: Request<any, any, CreateDTO>, res: Response) {
    const result = await this.useCase.create(req.body);
    res.status(201).json({ data: result });
  }

  async getDetailAPI(req: Request, res: Response) {
    const id = pickParam(req.params.id);
    const result = await this.useCase.getDetail(id);
    res.status(200).json({ data: result });
  }

  async updateAPI(req: Request<any, any, UpdateDTO>, res: Response) {
    const id = pickParam(req.params.id);
    const result = await this.useCase.update(id, req.body);
    res.status(200).json({ data: result });
  }

  async deleteAPI(req: Request, res: Response) {
    const id = pickParam(req.params.id);
    const result = await this.useCase.delete(id);
    res.status(200).json({ data: result });
  }

  async listAPI(req: Request, res: Response) {
    const paging = pagingDTOSchema.parse(req.query);

    const result = await this.useCase.list(req.query as Cond, paging);
    res.status(200).json({ data: result, paging, filter: req.query as Cond });
  }
}
