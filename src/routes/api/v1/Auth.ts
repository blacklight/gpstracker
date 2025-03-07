import { Optional } from '../../../types';
import { Request, Response } from 'express';

import ApiV1Route from './Route';
import { ValidationError } from '../../../errors';
import { AuthInfo, authenticate } from '../../../auth';
import { clearCookie, setCookie } from '../../../helpers/cookies';

class Auth extends ApiV1Route {
  constructor() {
    super('/auth');
  }

  /**
   * Create a new session for the user.
   *
   * If the user is already authenticated (either through a cookie or a token),
   * the existing session will be returned. Otherwise, a new session will be created.
   *
   * @param req: Request - The request object.
   * @param res: Response - The response object.
   * @param auth: Optional<AuthInfo> - The authentication information.
   */
  @authenticate()
  post = async (req: Request, res: Response, auth: Optional<AuthInfo>) => {
    const user = auth!.user;
    let session = auth!.session;
    const expiresAt = req.body?.expiresAt;
    let expiresAtDate: Optional<Date> = null;

    if (session) {
      console.debug('The user already has an active session or token');
      res.json({
        session: {
          token: session.getToken(),
        }
      });

      return;
    }

    if (expiresAt) {
      try {
        expiresAtDate = new Date(expiresAt);
      } catch (error) {
        throw new ValidationError(`Invalid expiresAt: ${error}`);
      }
    }

    session = await $repos.userSessions.create(user.id, {
      name: req.body?.name,
      expiresAt: expiresAtDate,
    })

    setCookie(res, {
      name: 'session',
      value: session.getToken(),
      expiresAt: expiresAtDate,
    });

    res.json({
      token: session.getToken(),
    });
  }

  /**
   * Delete the current session.
   *
   * It requires the user to be authenticated (either through a cookie or a token).
   * If the user is authenticated, the session will be destroyed and the cookie will be cleared.
   */
  @authenticate()
  delete = async (_: Request, res: Response, auth?: Optional<AuthInfo>) => {
    const session = auth!.session;

    if (session) {
      await session.destroy();
    }

    clearCookie(res, 'session');
    res.status(204).send();
  }
}

export default Auth;
