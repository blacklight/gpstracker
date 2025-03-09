import { Optional } from '../../../types';
import { Request, Response } from 'express';

import ApiV1Route from './Route';
import { ValidationError } from '../../../errors';
import { AuthInfo, authenticate } from '../../../auth';

class Tokens extends ApiV1Route {
  constructor() {
    super('/tokens');
  }

  /**
   * Create a new API token for the user.
   */
  @authenticate()
  post = async (req: Request, res: Response, auth: Optional<AuthInfo>) => {
    const user = auth!.user;
    const expiresAt = req.body?.expiresAt;
    let expiresAtDate: Optional<Date> = null;

    if (expiresAt) {
      try {
        expiresAtDate = new Date(expiresAt);
      } catch (error) {
        throw new ValidationError(`Invalid expiresAt: ${error}`);
      }
    }

    const session = await $repos.userSessions.create(user.id, {
      name: req.body?.name,
      isApi: true,
      expiresAt: expiresAtDate,
    })

    res.json({
      token: session.getToken(),
    });
  }

  /**
   * List all the API tokens for the user.
   */
  @authenticate()
  get = async (_: Request, res: Response, auth: Optional<AuthInfo>) => {
    const user = auth!.user;
    const sessions = await $repos.userSessions.byUser(user.id, { isApi: true });
    res.json({ tokens: sessions });
  }
}

export default Tokens;
