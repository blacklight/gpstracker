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

  public async create(userId: number, args: {
    expiresAt?: Optional<Date>,
    name?: Optional<string>,
    isApi?: Optional<boolean>,
  }): Promise<UserSession> {
    const session = await $db.UserSession().create({
      userId,
      name: args.name,
      isApi: args.isApi || false,
      expiresAt: args.expiresAt ? new Date(args.expiresAt).toISOString() : null,
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

  public async byUser(userId: number, { isApi }: { isApi?: boolean } = {}): Promise<UserSession[]> {
    const filter = { userId } as { userId: number, isApi?: boolean };
    if (isApi != null) {
      filter['isApi'] = !!isApi;
    }

    return (
      await $db.UserSession().findAll({
        where: filter,
      })
    ).map((session: any) => new UserSession(session.dataValues));
  }
}

export default UserSessions;
