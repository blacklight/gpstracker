import Location from './Location';
import Users from './Users';
import UserRoles from './UserRoles';
import UserSessions from './UserSessions';

class Repositories {
  public location: Location;
  public users: Users;
  public userRoles: UserRoles;
  public userSessions: UserSessions;

  constructor() {
    this.location = new Location();
    this.users = new Users();
    this.userRoles = new UserRoles();
    this.userSessions = new UserSessions();
  }
}

export default Repositories;
