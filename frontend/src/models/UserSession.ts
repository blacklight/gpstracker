import type { Optional } from "./Types";

class UserSession {
  public id: string;
  public userId: number;
  public createdAt: Date;
  public updatedAt: Date;
  public expiresAt: Optional<Date>;

  constructor(userSession: {
    id: string;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
  }) {
    this.id = userSession.id;
    this.userId = userSession.userId;
    this.createdAt = userSession.createdAt;
    this.updatedAt = userSession.updatedAt;
    this.expiresAt = userSession.expiresAt || null;
  }
}

export default UserSession;
