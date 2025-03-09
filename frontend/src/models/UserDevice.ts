import type { Optional } from "./Types";

class UserDevice {
  public id: string;
  public userId: number;
  public name: string;
  public createdAt?: Optional<Date>;

  constructor({
    id,
    userId,
    name,
    createdAt = null,
  }: {
   id: string,
   userId: number,
   name: string,
   createdAt?: Optional<Date>,
  }) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.createdAt = createdAt;
  }
}

export default UserDevice;
