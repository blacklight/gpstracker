import type { Optional } from "./Types";
import User from "./User";
import UserSession from "./UserSession";

class AuthInfo {
  public user: Optional<User>;
  public userSession: Optional<UserSession>;

  constructor(user?: User, userSession?: UserSession) {
    this.user = user || null;
    this.userSession = userSession || null;
  }
}

export default AuthInfo;
