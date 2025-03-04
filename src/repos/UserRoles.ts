import { Role, RoleName } from '../models';

class UserRoles {
  private static userRoleNames: string[] = Object.values(RoleName);

  public async init(): Promise<void> {
    UserRoles.userRoleNames.forEach(async (name) => {
      new Role({ name }).save();
    });
  }
}

export default UserRoles;
