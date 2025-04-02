import Location from './Location';
import Stats from './Stats';
import Users from './Users';
import UserDevices from './UserDevices';
import UserRoles from './UserRoles';
import UserSessions from './UserSessions';

class Repositories {
  public location: Location;
  public stats: Stats;
  public users: Users;
  public userDevices: UserDevices;
  public userRoles: UserRoles;
  public userSessions: UserSessions;

  constructor() {
    this.location = new Location();
    this.stats = new Stats();
    this.users = new Users();
    this.userDevices = new UserDevices();
    this.userRoles = new UserRoles();
    this.userSessions = new UserSessions();
  }
}

export default Repositories;
