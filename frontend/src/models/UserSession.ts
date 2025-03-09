import type { Optional } from "./Types";

class UserSession {
  public id: string;
  public userId: number;
  public name: string;
  public isApi: boolean;
  public createdAt: Date;
  public expiresAt: Optional<Date>;

  constructor({
    id,
    userId,
    name,
    isApi = false,
    createdAt,
    expiresAt = null,
  }: {
    id: string;
    userId: number;
    name: string;
    isApi?: boolean;
    createdAt: Date;
    expiresAt?: Optional<Date>;
  }) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.isApi = isApi;
    this.createdAt = createdAt;
    this.expiresAt = expiresAt || null;
  }
}

export default UserSession;
