import test from 'node:test';
import assert from 'node:assert/strict';
import { DomainEvent, IEventBus } from '../modules/post/domain/interfaces/post.interfaces';
import { DeleteMessageUseCase } from '../modules/messaging/application/use-cases/delete-message.usecase';
import { ListConversationsUseCase } from '../modules/messaging/application/use-cases/list-conversations.usecase';
import { SendMessageUseCase } from '../modules/messaging/application/use-cases/send-message.usecase';
import { Conversation, Message } from '../modules/messaging/domain/entities/conversation.entity';
import { IMessagingRepository } from '../modules/messaging/domain/interfaces/messaging.interfaces';
import { DomainEventName } from '../shared/constants/events';

class FakeMessagingRepository implements IMessagingRepository {
  public async listConversations(_userId: string, _limit: number): Promise<Conversation[]> {
    return [
      {
        id: 'room-1',
        name: null,
        type: 'direct',
        creatorId: 'u1',
        createdAt: new Date()
      }
    ];
  }

  public async createDirectConversation(_creatorId: string, _participantId: string): Promise<string> {
    return 'room-1';
  }

  public async ensureParticipant(roomId: string, userId: string): Promise<boolean> {
    return roomId === 'room-1' && userId === 'u1';
  }

  public async sendMessage(input: {
    roomId: string;
    senderId: string;
    content?: string;
    fileUrl?: string;
  }): Promise<Message> {
    return {
      id: 'm1',
      roomId: input.roomId,
      senderId: input.senderId,
      content: input.content ?? null,
      fileUrl: input.fileUrl ?? null,
      createdAt: new Date()
    };
  }

  public async setReaction(_input: { messageId: string; userId: string; emoji: string }): Promise<boolean> {
    return true;
  }

  public async removeMessageByOwner(messageId: string, userId: string): Promise<boolean> {
    return messageId === 'm1' && userId === 'u1';
  }

  public async removeMessageById(messageId: string): Promise<boolean> {
    return messageId === 'm1';
  }

  public async removeRoomByCreator(_roomId: string, _userId: string): Promise<boolean> {
    return true;
  }

  public async removeRoomById(_roomId: string): Promise<boolean> {
    return true;
  }
}

class FakeEventBus implements IEventBus {
  public async publish<TPayload>(_event: DomainEvent<TPayload>): Promise<void> {}
  public subscribe<TPayload>(
    _eventName: DomainEventName,
    _handler: (event: DomainEvent<TPayload>) => Promise<void>
  ): void {}
}

test('list conversations returns data', async () => {
  const useCase = new ListConversationsUseCase(new FakeMessagingRepository());
  const conversations = await useCase.execute({ userId: 'u1', limit: 10 });
  assert.equal(conversations.length, 1);
  assert.equal(conversations[0]?.id, 'room-1');
});

test('send message requires participant', async () => {
  const useCase = new SendMessageUseCase(new FakeMessagingRepository(), new FakeEventBus());
  await assert.rejects(
    async () =>
      useCase.execute({
        userId: 'u2',
        roomId: 'room-1',
        content: 'hello'
      }),
    /Forbidden/
  );
});

test('delete message allows admin override', async () => {
  const useCase = new DeleteMessageUseCase(new FakeMessagingRepository());
  const ownerDeleted = await useCase.execute({
    userId: 'u1',
    role: 'user',
    messageId: 'm1'
  });
  const adminDeleted = await useCase.execute({
    userId: 'u2',
    role: 'admin',
    messageId: 'm1'
  });
  assert.equal(ownerDeleted, true);
  assert.equal(adminDeleted, true);
});
