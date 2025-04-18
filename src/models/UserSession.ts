import jwt from 'jsonwebtoken';

import { Optional } from '~/types';

class UserSession {
  public id: string;
  public userId: number;
  public name?: Optional<string>;
  public isApi: boolean;
  public expiresAt: Optional<Date>;
  public createdAt: Optional<Date>;

  constructor({
    id,
    userId,
    name,
    isApi = false,
    expiresAt = null,
    createdAt = null,
  }: {
    id: string;
    userId: number;
    name?: Optional<string>;
    isApi?: boolean;
    expiresAt?: Optional<Date>;
    createdAt?: Optional<Date>;
  }) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.isApi = isApi;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;

    ['expiresAt', 'createdAt'].forEach((key) => {
      if ((this as any)[key] && !((this as any)[key] instanceof Date)) {
        (this as any)[key] = new Date((this as any)[key]);
      }
    });
  }

  public getToken() {
    return jwt.sign({
      sessionId: this.id,
      userId: this.userId,
    }, $secrets.serverKey);
  }

  public destroy() {
    return $db.UserSession().destroy({
      where: {
        id: this.id,
      },
    });
  }
}

export default UserSession;
