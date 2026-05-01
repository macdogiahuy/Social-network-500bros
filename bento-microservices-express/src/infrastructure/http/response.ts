import { Response } from 'express';

export type ErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export const ok = <T>(res: Response, data: T, status = 200): void => {
  const traceId = (res.locals.traceId as string | undefined) ?? 'unknown';
  res.status(status).json({
    code: 'OK',
    message: 'success',
    details: data,
    traceId
  });
};

export const fail = (res: Response, status: number, payload: ErrorPayload): void => {
  const traceId = (res.locals.traceId as string | undefined) ?? 'unknown';
  res.status(status).json({
    ...payload,
    traceId
  });
};
