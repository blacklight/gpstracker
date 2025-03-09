import { Optional } from '~/types';

class UserDevice {
  public id: string;
  public userId: number;
  public name: string;
  public createdAt: Optional<Date>;

  constructor({
    id,
    userId,
    name,
    createdAt = null,
  }: {
    id: string;
    userId: number;
    name: string;
    createdAt?: Optional<Date>;
  }) {
    this.id = id;
    this.name = name;
    this.userId = userId;
    this.createdAt = createdAt ? new Date(createdAt) : null;
  }

  public async destroy() {
    await $db.UserDevice().destroy({
      where: {
        id: this.id,
      },
    });
  }

  public async save() {
    await $db.UserDevice().update(
      {
        name: this.name,
      },
      {
        where: {
          id: this.id,
        },
      }
    );
  }
}

export default UserDevice;
