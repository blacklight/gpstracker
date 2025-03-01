import ApiRoutes from "./api";
import Routes from "./Routes";

class AllRoutes extends Routes {
  private api: ApiRoutes = new ApiRoutes();
  public routes = [...this.api.routes];
}

export default AllRoutes;
