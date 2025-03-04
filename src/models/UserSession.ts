import jwt from 'jsonwebtoken';

import { Optional } from '~/types';

class UserSession {
  public id: string;
  public userId: number;
  public expiresAt: Optional<Date>;
  public createdAt: Optional<Date>;
  public updatedAt: Optional<Date>;

  constructor({
    id,
    userId,
    expiresAt = null,
    createdAt = null,
    updatedAt = null,
  }: any) {
    this.id = id;
    this.userId = userId;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    ['expiresAt', 'createdAt', 'updatedAt'].forEach((key) => {
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
