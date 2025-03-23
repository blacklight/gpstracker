import ApiRoutes from "./api";
import IconRoutes from "./Icons";
import Routes from "./Routes";

class AllRoutes extends Routes {
  private api: ApiRoutes = new ApiRoutes();
  private icons: IconRoutes = new IconRoutes();

  public routes = [
    ...this.api.routes,
    ...this.icons.routes,
  ];
}

export default AllRoutes;
