import { Request, Response } from 'express';

import Route from '../Route';
import { Unauthorized, } from '../../errors';

abstract class ApiRoute extends Route {
  protected version: string;

  constructor(path: string, version: string) {
    super(ApiRoute.toApiPath(path, version));
  }

  protected static handleError(req: Request, res: Response, error: Error) {
    // Handle API unauthorized errors with a 401+JSON response instead of a redirect
    if (error instanceof Unauthorized) {
      res.status(401).json({
        error: error.message,
      });

      return;
    }

    return super.handleError(req, res, error);
  }

  protected static toApiPath(path: string, version: string): string {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }

    return `/api/${version}${path}`;
  }
}

export default ApiRoute;
