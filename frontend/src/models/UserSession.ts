import type { Optional } from "./Types";

class UserSession {
  public id: string;
  public userId: number;
  public createdAt: Date;
  public expiresAt: Optional<Date>;

  constructor(userSession: {
    id: string;
    userId: number;
    createdAt: Date;
    expiresAt?: Date;
  }) {
    this.id = userSession.id;
    this.userId = userSession.userId;
    this.createdAt = userSession.createdAt;
    this.expiresAt = userSession.expiresAt || null;
  }
}

export default UserSession;
