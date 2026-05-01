import { Conversation } from '../../domain/entities/conversation.entity';
import { IMessagingRepository } from '../../domain/interfaces/messaging.interfaces';

export class ListConversationsUseCase {
  public constructor(private readonly messagingRepository: IMessagingRepository) {}

  public async execute(input: { userId: string; limit: number }): Promise<Conversation[]> {
    return this.messagingRepository.listConversations(input.userId, input.limit);
  }
}
