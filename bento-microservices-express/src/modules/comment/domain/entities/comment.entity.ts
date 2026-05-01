import { randomUUID } from 'crypto';

export type CommentProps = {
  id: string;
  content: string;
  userId: string;
  postId: string;
  parentId: string | null;
  createdAt: Date;
};

export class CommentEntity {
  private constructor(private readonly props: CommentProps) {}

  public static create(input: {
    content: string;
    userId: string;
    postId: string;
    parentId?: string | null;
  }): CommentEntity {
    const content = input.content.trim();
    if (!content) {
      throw new Error('Comment content must not be empty');
    }

    return new CommentEntity({
      id: randomUUID(),
      content,
      userId: input.userId,
      postId: input.postId,
      parentId: input.parentId ?? null,
      createdAt: new Date()
    });
  }

  public toObject(): CommentProps {
    return { ...this.props };
  }
}
