import dotenv from 'dotenv';

import { Db } from './db';
import Geocode from './config/Geocode';
import Secrets from './Secrets';
import Repositories from './repos';

dotenv.config();

declare global {
  var $db: Db;
  var $repos: Repositories;
  var $secrets: Secrets;
  var $geocode: Geocode;
}

export function useGlobals() {
  globalThis.$secrets = Secrets.fromEnv();
  globalThis.$db = Db.fromEnv();
  globalThis.$geocode = Geocode.fromEnv();
  globalThis.$repos = new Repositories();
}
