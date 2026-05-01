import { DomainEvents } from '../../../../shared/constants/events';
import { IEventBus } from '../../../post/domain/interfaces/post.interfaces';
import { Message } from '../../domain/entities/conversation.entity';
import { IMessagingRepository } from '../../domain/interfaces/messaging.interfaces';

export class SendMessageUseCase {
  public constructor(
    private readonly messagingRepository: IMessagingRepository,
    private readonly eventBus: IEventBus
  ) {}

  public async execute(input: {
    userId: string;
    roomId: string;
    content?: string;
    fileUrl?: string;
  }): Promise<Message> {
    if (!input.content && !input.fileUrl) {
      throw new Error('content or fileUrl is required');
    }

    const isParticipant = await this.messagingRepository.ensureParticipant(input.roomId, input.userId);
    if (!isParticipant) {
      throw new Error('Forbidden');
    }

    const message = await this.messagingRepository.sendMessage({
      roomId: input.roomId,
      senderId: input.userId,
      content: input.content,
      fileUrl: input.fileUrl
    });

    await this.eventBus.publish({
      name: DomainEvents.MessageSent,
      payload: {
        messageId: message.id,
        roomId: message.roomId,
        senderId: message.senderId
      }
    });

    return message;
  }
}
