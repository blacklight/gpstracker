import type { Optional } from "./Types";

class User {
  public id: number;
  public username: number;
  public email: string;
  public firstName: Optional<string>;
  public lastName: Optional<string>;
  public createdAt: Optional<Date>;

  constructor(user: {
    id: number;
    username: number;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt?: Date;
  }) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.firstName = user.firstName || null;
    this.lastName = user.lastName || null;
    this.createdAt = user.createdAt || null;
  }
}

export default User;
