import { Db } from 'src/db';
import LocationRepository from './LocationRepository';

class Repositories {
  public location: LocationRepository;

  constructor(db: Db) {
    this.location = new LocationRepository(db);
  }
}

export default Repositories;
