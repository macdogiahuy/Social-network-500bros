import { IMessagingRepository } from '../../domain/interfaces/messaging.interfaces';

export class DeleteRoomUseCase {
  public constructor(private readonly messagingRepository: IMessagingRepository) {}

  public async execute(input: { userId: string; role: 'user' | 'admin'; roomId: string }): Promise<boolean> {
    if (input.role === 'admin') {
      return this.messagingRepository.removeRoomById(input.roomId);
    }
    return this.messagingRepository.removeRoomByCreator(input.roomId, input.userId);
  }
}
