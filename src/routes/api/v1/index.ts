import Auth from "./Auth";
import GPSData from "./GPSData";
import Routes from "../../Routes";
import UserSelf from "./UserSelf";

class ApiV1Routes extends Routes {
  public routes = [
    new Auth(),
    new GPSData(),
    new UserSelf(),
  ];
}

export default ApiV1Routes;
