import { Op } from 'sequelize';
import { Optional } from '~/types';
import RoleName from './RoleName';

class Role {
  public id: number;
  public name: RoleName;
  public createdAt: Optional<Date>;

  constructor({
    id,
    name,
    createdAt = null,
  }: any) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
  }

  public async get(role: number | string): Promise<Optional<Role>> {
    const dbRole = await $db.Role().findOne({
      where: {
        [Op.or]: [
          { id: role },
          { name: role },
        ],
      },
    });

    if (!dbRole) {
      return null;
    }

    return new Role(dbRole.dataValues);
  }

  public async save(): Promise<void> {
    const userRole = await $db.Role().findOne({
      where: {
        name: this.name,
      },
    });

    if (!userRole) {
      await $db.Role().create({
        name: this.name,
        createdAt: new Date(),
      });
    } else {
      await userRole.update({
        name: this.name,
      });
    }
  }
}

export default Role;
