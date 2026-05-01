import {
  DomainEvent,
  IEventBus
} from '../../modules/post/domain/interfaces/post.interfaces';
import { DomainEventName } from '../../shared/constants/events';

type EventHandler<TPayload> = (event: DomainEvent<TPayload>) => Promise<void>;

export class InMemoryEventBus implements IEventBus {
  private readonly subscriptions = new Map<DomainEventName, EventHandler<unknown>[]>();

  public subscribe<TPayload>(
    eventName: DomainEventName,
    handler: (event: DomainEvent<TPayload>) => Promise<void>
  ): void {
    const currentHandlers = this.subscriptions.get(eventName) ?? [];
    this.subscriptions.set(eventName, [...currentHandlers, handler as EventHandler<unknown>]);
  }

  public async publish<TPayload>(event: DomainEvent<TPayload>): Promise<void> {
    const handlers = this.subscriptions.get(event.name) ?? [];
    for (const handler of handlers) {
      await handler(event as DomainEvent<unknown>);
    }
  }
}
