import { ServiceContext } from '@shared/interface';
import { Router } from 'express';
import { MysqlConversationRepository } from './infras/repository/mysql';
import { ConversationHttpService } from './infras/transport/http-service';
import { ConversationUseCase } from './usecase/conversation.usecase';

export function setupConversationModule(ctx: ServiceContext): Router {
  const repository = new MysqlConversationRepository();
  const useCase = new ConversationUseCase(repository, ctx.eventPublisher);
  const httpService = new ConversationHttpService(useCase);

  return httpService.getRoutes(ctx.mdlFactory);
}
