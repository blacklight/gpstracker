import { Request } from 'express';

import { Forbidden, Unauthorized } from './errors';
import { Optional } from '~/types';
import { RoleName, User, UserSession } from '~/models';
import Route from './routes/Route';

class AuthInfo {
  public user: User;
  public session: Optional<UserSession>;

  constructor(user: User, session: Optional<UserSession> = null) {
    this.user = user;
    this.session = session;
  }
}

function authenticate(roles: RoleName[] = []) {
  return function (route: any, method: string) {
    const routeClass = (<typeof Route> route.constructor);
    routeClass.preRequestHandlers[method] = async (req: Request): Promise<AuthInfo> => {
      let user: Optional<User>;
      let session: Optional<UserSession>;

      // Check the `session` cookie or the `Authorization` header for the session token
      let token = req.cookies?.session;
      if (!token?.length) {
        const authHeader = req.headers?.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.slice(7);
        }
      }

      // Check if the token is valid
      if (token?.length) {
        session = await $repos.userSessions.byToken(token);
        if (session) {
          user = await $repos.users.get(session.userId);
        }
      }

      if (!(session && user)) {
        // Check the `username` and `password` query or body parameters
        const username = req.body?.username || req.query?.username;
        const password = req.body?.password || req.query?.password;

        if (username?.length && password?.length) {
          user = await $repos.users.find(username);
          if (!(user && user.checkPassword(password))) {
            user = null;
          }
        }
      }

      if (!user) {
        throw new Unauthorized('Invalid credentials');
      }

      if (roles.length) {
        // Check if the user has the required roles
        const userRoles = new Set((await user.roles()).map((role) => role.name));
        const missingPermissions = roles.filter((role) => !userRoles.has(role));

        if (missingPermissions.length) {
          throw new Forbidden('Missing required roles: [' + missingPermissions.join(', ') + ']');
        }
      }

      return new AuthInfo(user, session);
    }
  }
}

export { AuthInfo, authenticate };
