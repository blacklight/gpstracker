import dotenv from 'dotenv';

import { Db } from './db';
import Repositories from './repos';

dotenv.config();

declare global {
  var $db: Db;
  var $repos: Repositories;
}

export function useGlobals() {
  globalThis.$db = Db.fromEnv();
  globalThis.$repos = new Repositories(globalThis.$db);
}
