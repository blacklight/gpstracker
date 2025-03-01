import GPSData from "./GPSData";
import Routes from "../../Routes";

class ApiV1Routes extends Routes {
  public routes = [new GPSData()];
}

export default ApiV1Routes;
