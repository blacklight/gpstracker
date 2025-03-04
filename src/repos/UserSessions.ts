import jwt from 'jsonwebtoken';

import { Optional } from '~/types';
import { Unauthorized } from '../errors';
import { UserSession } from '../models';

class UserSessions {
  public async find(sessionId: string): Promise<Optional<UserSession>> {
    const dbSession = await $db.UserSession().findByPk(sessionId)
    if (!dbSession) {
      return null;
    }

    const session = new UserSession(dbSession.dataValues);
    if (session.expiresAt && session.expiresAt < new Date()) {
      await session.destroy();
      return null;
    }

    return session;
  }

  public async create(userId: number, expiresAt: Optional<Date> = null): Promise<UserSession> {
    const session = await $db.UserSession().create({
      userId,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });

    return new UserSession(session.dataValues);
  }

  public async byToken(token: string): Promise<Optional<UserSession>> {
    let payload: Record<string, any>

    try {
      payload = jwt.verify(token, $secrets.serverKey) as {
        sessionId: string, userId: number
      };
    } catch (error) {
      throw new Unauthorized('Invalid token');
    }

    const session = await this.find(payload.sessionId);
    let expiresAt = session?.expiresAt;

    if (
      !session ||
      session.userId !== payload.userId ||
      (expiresAt && expiresAt < new Date())
    ) {
      throw new Unauthorized('Invalid token');
    }

    return session;
  }
}

export default UserSessions;
