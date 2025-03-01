import ApiV1Routes from "./v1";
import Routes from "../Routes";

class ApiRoutes extends Routes {
  private v1: ApiV1Routes = new ApiV1Routes();
  public routes = [...this.v1.routes];
}

export default ApiRoutes;
