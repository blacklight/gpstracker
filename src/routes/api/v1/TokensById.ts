import { Optional } from '../../../types';
import { Request, Response } from 'express';

import ApiV1Route from './Route';
import { AuthInfo, authenticate } from '../../../auth';
import { RoleName } from '../../../models';

class TokensById extends ApiV1Route {
  constructor() {
    super('/tokens/:id');
  }

  /**
   * Delete an API token given its (session) ID.
   */
  @authenticate()
  delete = async (req: Request, res: Response, auth?: Optional<AuthInfo>) => {
    const user = auth!.user;
    const sessionId = req.params.id;
    const session = await $repos.userSessions.find(sessionId);

    if (!session) {
      res.status(404).send();
      return;
    }

    if (session.userId !== user.id) {
      // Only the owner of the token or admin users can delete it.
      authenticate([RoleName.Admin]);
    }

    await session.destroy();
    res.status(204).send();
  }
}

export default TokensById;
