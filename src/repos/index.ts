import Location from './Location';
import Users from './Users';
import UserDevices from './UserDevices';
import UserRoles from './UserRoles';
import UserSessions from './UserSessions';

class Repositories {
  public location: Location;
  public users: Users;
  public userDevices: UserDevices;
  public userRoles: UserRoles;
  public userSessions: UserSessions;

  constructor() {
    this.location = new Location();
    this.users = new Users();
    this.userDevices = new UserDevices();
    this.userRoles = new UserRoles();
    this.userSessions = new UserSessions();
  }
}

export default Repositories;
