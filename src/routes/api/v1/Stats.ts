import { Request, Response } from 'express';

import { authenticate } from '../../../auth';
import { AuthInfo } from '../../../auth';
import { Optional } from '../../../types';
import { StatsRequest } from '../../../requests';
import ApiV1Route from './Route';

class Stats extends ApiV1Route {
  constructor() {
    super('/stats');
  }

  @authenticate()
  get = async (req: Request, res: Response, auth: Optional<AuthInfo>) => {
    let query: StatsRequest;

    try {
      query = new StatsRequest({
        ...req.query as any,
        userId: auth!.user.id,
      });
    } catch (error) {
      const e = `Error parsing query: ${error}`;
      console.warn(e);
      res.status(400).send(e);
      return;
    }

    res.json(await $repos.stats.get(query));
  }
}

export default Stats;
