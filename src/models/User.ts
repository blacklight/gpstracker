import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

import { Optional } from '~/types';
import Role from './Role';
import RoleName from './RoleName';
import UserDevice from './UserDevice';

class User {
  public id: number;
  public username: string;
  public password: string;
  public email: string;
  public firstName: Optional<string>;
  public lastName: Optional<string>;
  public createdAt: Optional<Date>;

  constructor({
    id,
    username,
    email,
    password,
    firstName = null,
    lastName = null,
    createdAt = null,
  }: User) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.createdAt = createdAt;
  }

  public static hashPassword(password: string): string {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }

  public checkPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }

  public async roles(): Promise<Role[]> {
    return (
      await $db.UserRole().findAll({
        where: {
          userId: this.id,
        },
      })
    ).map((role) => new Role(role.dataValues));
  }

  public async devices(): Promise<UserDevice[]> {
    return (
      await $db.UserDevice().findAll({
        where: {
          userId: this.id,
        },
      })
    ).map((device) => new UserDevice(device.dataValues));
  }

  public async setRoles(roles: (Role | RoleName | number | string)[]): Promise<void> {
    const inputRoleIds = new Set(
      roles.filter((role) => {
        role instanceof Role || typeof role === 'number'
      }).map((role) => {
        if (role instanceof Role) {
          return role.id;
        }

        return role;
      })
    );

    const inputRoleNames = new Set(
      roles.filter((role) => {
        typeof role === 'string'
      }).map((role) => {
        return role;
      })
    );

    if (!inputRoleIds.size && !inputRoleNames.size) {
      return;  // No roles to set
    }

    const query: Record<string, any> = {}
    if (inputRoleIds.size) {
      query['id'] = [...inputRoleIds];
    }

    if (inputRoleNames.size) {
      query['name'] = [...inputRoleNames];
    }

    const roleIds = new Set(
      (
        await $db.Role().findAll({
          where: {
            [Op.or]: query,
          },
        })
      ).map((role) => (role as any).id)
    );

    const userRoles = await $db.UserRole().findAll({
      where: {
        userId: this.id,
      },
    });

    const userRoleIds = new Set(userRoles.map((role) => (role as any).roleId));
    const toAdd = [...roleIds].filter((roleId) => !userRoleIds.has(roleId));
    const toRemove = userRoles.filter((role) => !roleIds.has((role as any).roleId)).map((role) => (role as any).roleId);

    await $db.UserRole().bulkCreate(
      toAdd.map((roleId) => ({
        userId: this.id,
        roleId: roleId,
      })),
    );

    await $db.UserRole().destroy({
      where: {
        userId: this.id,
        roleId: toRemove,
      },
    });
  }

  public async save(): Promise<void> {
    this.password = User.hashPassword(this.password);
    await $db.User().update(this, {
      where: {
        id: this.id,
      },
    });
  }
}

export default User;
