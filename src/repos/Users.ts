import { Op } from 'sequelize';

import { Optional } from '~/types';
import { RoleName } from '../models';
import { User } from '../models';
import { ValidationError } from '../errors';

class Users {
  public async syncAdminUser(): Promise<User> {
    const adminPassword = $secrets.adminPassword;
    let adminUser = await this.find('admin');
    const adminEmail = $secrets.adminEmail;

    if (adminUser) {
      let changed = false;

      if (!adminUser.checkPassword(adminPassword)) {
        adminUser.password = adminPassword;
        changed = true;
      }

      if (adminUser.email !== adminEmail) {
        adminUser.email = adminEmail;
        changed = true;
      }

      if (!changed) {
        return adminUser;
      }

      await adminUser.save();
    } else {
      console.log('Creating admin user');
      adminUser = await this.create({
        username: 'admin',
        email: adminEmail,
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
      });

      console.log('Admin user created');
    }

    await adminUser.setRoles([RoleName.Admin]);
    return adminUser;
  }

  public async get(userId: number): Promise<Optional<User>> {
    const dbUser = await $db.User().findByPk(userId);

    if (!dbUser) {
      return null;
    }

    return new User(dbUser.dataValues);
  }

  public async find(username: string): Promise<Optional<User>> {
    const dbUser = await $db.User().findOne({
      where: {
        [Op.or]: {
          username,
          email: username,
        },
      },
    });

    if (!dbUser) {
      return null;
    }

    return new User(dbUser.dataValues);
  }

  public async set(username: string, {
    password = null,
    email = null,
    firstName = null,
    lastName = null,
  }: any): Promise<void> {
    const dbUser = await this.find(username);
    let changed = false;

    if (!dbUser) {
      console.log(`User ${username} not found`);
      return;
    }

    if (password?.length) {
      console.log(`Updating password for ${username}`);
      dbUser.password = password;
      changed = true;
    }

    if (email?.length) {
      if (!email.includes('@')) {
        throw new ValidationError('Invalid email');
      }

      dbUser.email = email;
      changed = true;
    }

    if (firstName?.length) {
      dbUser.firstName = firstName;
      changed = true;
    }

    if (lastName?.length) {
      dbUser.lastName = lastName;
      changed = true;
    }

    if (changed) {
      await dbUser.save();
    }
  }

  public async create({
    username,
    email,
    password,
    firstName = null,
    lastName = null,
  }: any): Promise<User> {
    const dbUser = await $db.User().create({
      username,
      email,
      password: User.hashPassword(password),
      firstName,
      lastName,
    });

    return new User(dbUser.dataValues);
  }
}

export default Users;
