import ApiRoute from '../Route';

abstract class ApiV1Route extends ApiRoute {
  constructor(path: string) {
    super(path, 'v1');
  }
}

export default ApiV1Route;
