import Route from '../Route';

abstract class ApiRoute extends Route {
  protected version: string;

  constructor(path: string, version: string) {
    super(ApiRoute.toApiPath(path, version));
  }

  protected static toApiPath(path: string, version: string): string {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }

    return `/api/${version}${path}`;
  }
}

export default ApiRoute;
