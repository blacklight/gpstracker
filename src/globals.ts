import dotenv from 'dotenv';

import { Db } from './db';
import Secrets from './Secrets';
import Repositories from './repos';

dotenv.config();

declare global {
  var $db: Db;
  var $repos: Repositories;
  var $secrets: Secrets;
}

export function useGlobals() {
  globalThis.$secrets = Secrets.fromEnv();
  globalThis.$db = Db.fromEnv();
  globalThis.$repos = new Repositories();
}
