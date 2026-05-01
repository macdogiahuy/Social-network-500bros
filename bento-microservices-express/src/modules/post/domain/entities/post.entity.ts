import { randomUUID } from 'crypto';

export type PostProps = {
  id: string;
  authorId: string;
  topicId: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
};

export type CreatePostProps = {
  authorId: string;
  topicId: string;
  content: string;
  imageUrl?: string | null;
};

export class PostEntity {
  private constructor(private readonly props: PostProps) {}

  public static create(input: CreatePostProps): PostEntity {
    const content = input.content.trim();

    if (!content) {
      throw new Error('Post content must not be empty');
    }

    if (content.length > 2000) {
      throw new Error('Post content exceeds the maximum length');
    }

    return new PostEntity({
      id: randomUUID(),
      authorId: input.authorId,
      topicId: input.topicId,
      content,
      imageUrl: input.imageUrl ?? null,
      createdAt: new Date()
    });
  }

  public toObject(): PostProps {
    return { ...this.props };
  }
}
