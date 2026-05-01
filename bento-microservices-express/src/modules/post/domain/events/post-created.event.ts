import { DomainEvents } from '../../../../shared/constants/events';

export type PostCreatedEvent = {
  name: typeof DomainEvents.PostCreated;
  payload: {
    postId: string;
    authorId: string;
    topicId: string;
    createdAt: string;
  };
};
