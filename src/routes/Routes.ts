import { Express } from 'express';

import Route from './Route';

abstract class Routes {
  public abstract routes: Route[];

  public register(app: Express) {
    this.routes.forEach((route) => {
      route.register(app);
    });
  }
}

export default Routes;
