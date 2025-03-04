import { Request, Response } from 'express';

import { AuthInfo } from './auth';

type Optional<T> = T | null | undefined;
type RequestHandler = (req: Request, res: Response) => Promise<AuthInfo>;

export {
  Optional,
  RequestHandler,
};
