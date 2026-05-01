import { IMessagingRepository } from '../../domain/interfaces/messaging.interfaces';

export class ReactMessageUseCase {
  public constructor(private readonly messagingRepository: IMessagingRepository) {}

  public async execute(input: { userId: string; messageId: string; emoji: string }): Promise<boolean> {
    if (!input.emoji.trim()) {
      throw new Error('emoji is required');
    }
    return this.messagingRepository.setReaction(input);
  }
}
