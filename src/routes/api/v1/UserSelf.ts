import { Optional } from '../../../types';
import { Request, Response } from 'express';

import ApiV1Route from './Route';
import { AuthInfo, authenticate } from '../../../auth';
import { maskPassword } from '../../../helpers/security';

class UserSelf extends ApiV1Route {
  constructor() {
    super('/users/me');
  }

  /**
   * GET /users/me
   *
   * It returns a JSON object with the user and session information.
   */
  @authenticate()
  get = async (_: Request, res: Response, auth: Optional<AuthInfo>) => {
    const user = auth!.user;
    const session = auth!.session;

    res.json({
      user: maskPassword(user),
      ...(session ? { session } : {}),
    });
  }
}

export default UserSelf;
