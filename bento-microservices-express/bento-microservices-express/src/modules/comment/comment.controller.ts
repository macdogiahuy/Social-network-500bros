import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';

@singleton()
export class CommentController {
  constructor() {}

  async createComment(req: Request, res: Response) {
    try {
      // Implement create comment logic
      return res.status(StatusCodes.NOT_IMPLEMENTED).json({
        error: 'Not implemented'
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }

  async getComments(req: Request, res: Response) {
    try {
      // Implement get comments logic
      return res.status(StatusCodes.NOT_IMPLEMENTED).json({
        error: 'Not implemented'
      });
    } catch (error) {
      console.error('Error getting comments:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }
}
