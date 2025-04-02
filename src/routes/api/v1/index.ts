import Auth from "./Auth";
import Devices from "./Devices";
import DevicesById from "./DevicesById";
import GPSData from "./GPSData";
import Routes from "../../Routes";
import Stats from "./Stats";
import Tokens from "./Tokens";
import TokensById from "./TokensById";
import UserSelf from "./UserSelf";

class ApiV1Routes extends Routes {
  public routes = [
    new Auth(),
    new Devices(),
    new DevicesById(),
    new GPSData(),
    new Stats(),
    new Tokens(),
    new TokensById(),
    new UserSelf(),
  ];
}

export default ApiV1Routes;
