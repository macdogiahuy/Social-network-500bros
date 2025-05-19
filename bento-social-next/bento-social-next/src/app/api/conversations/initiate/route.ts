import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId } = await req.json();
    const senderId = session.user.id;

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await db.conversation.findFirst({
      where: {
        OR: [
          {
            AND: [{ senderId: senderId }, { receiverId: receiverId }],
          },
          {
            AND: [{ senderId: receiverId }, { receiverId: senderId }],
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        messages: {
          take: 20,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const newConversation = await db.conversation.create({
      data: {
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error('Error initiating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
