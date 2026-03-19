import { ITopicRepository } from '@modules/topic/interface/interface';
import { Topic, TopicCondDTO, TopicUpdateDTO } from '@modules/topic/model/topic';
import prisma from '@shared/components/prisma';
import { Paginated, PagingDTO } from '@shared/model';

export class PrismaTopicRepository implements ITopicRepository {
  async insert(data: Topic): Promise<boolean> {
    await prisma.topics.create({ data });
    return true;
  }

  async update(id: string, data: TopicUpdateDTO): Promise<boolean> {
    await prisma.topics.update({ where: { id }, data });
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await prisma.topics.delete({ where: { id } });
    return true;
  }

  async findById(id: string): Promise<Topic | null> {
    const topic = await prisma.topics.findUnique({ where: { id } });
    return topic as Topic;
  }

  async findByCond(condition: TopicCondDTO): Promise<Topic | null> {
    const topic = await prisma.topics.findFirst({ where: condition });
    return topic as Topic;
  }

  async list(condition: TopicCondDTO, paging: PagingDTO): Promise<Paginated<Topic>> {
    const skip = (paging.page - 1) * paging.limit;

    const total = await prisma.topics.count({ where: condition });

    const data = await prisma.topics.findMany({
      where: condition,
      take: paging.limit,
      skip,
      orderBy: {
        id: 'desc'
      }
    });

    return {
      data: data as Topic[],
      paging,
      total
    };
  }

  async search(query: string, paging: PagingDTO): Promise<Paginated<Topic>> {
    const skip = (paging.page - 1) * paging.limit;

    // Convert query to lowercase for case-insensitive search
    const lowerQuery = query.toLowerCase();

    // First get all topics
    const allTopics = await prisma.topics.findMany();

    // Filter topics where name contains the query (case-insensitive)
    const filteredTopics = allTopics.filter((topic) => topic.name.toLowerCase().includes(lowerQuery));

    const total = filteredTopics.length;

    // Apply pagination manually
    const data = filteredTopics.sort((a, b) => a.name.localeCompare(b.name)).slice(skip, skip + paging.limit);

    return {
      data: data as Topic[],
      paging,
      total
    };
  }

  async increateTopicPostCount(id: string, field: string, step: number): Promise<boolean> {
    await prisma.topics.update({
      where: {
        id
      },
      data: {
        [field]: {
          increment: step
        }
      }
    });
    return true;
  }

  async decreaseTopicPostCount(id: string, field: string, step: number): Promise<boolean> {
    await prisma.topics.update({
      where: {
        id
      },
      data: {
        [field]: {
          decrement: step
        }
      }
    });
    return true;
  }

  async findByIds(ids: string[]): Promise<Topic[]> {
    const topics = await prisma.topics.findMany({ where: { id: { in: ids } } });
    return topics as Topic[];
  }
}
