import { IMessagingRepository } from '../../domain/interfaces/messaging.interfaces';

export class DeleteMessageUseCase {
  public constructor(private readonly messagingRepository: IMessagingRepository) {}

  public async execute(input: {
    userId: string;
    role: 'user' | 'admin';
    messageId: string;
  }): Promise<boolean> {
    if (input.role === 'admin') {
      return this.messagingRepository.removeMessageById(input.messageId);
    }
    return this.messagingRepository.removeMessageByOwner(input.messageId, input.userId);
  }
}
