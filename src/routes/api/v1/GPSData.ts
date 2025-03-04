import { Request, Response } from 'express';

import { authenticate } from '../../../auth';
import { LocationRequest } from '../../../requests';
import ApiV1Route from './Route';

class GPSData extends ApiV1Route {
  constructor() {
    super('/gpsdata');
  }

  @authenticate()
  get = async (req: Request, res: Response) => {
    let query: LocationRequest

    try {
      query = new LocationRequest(req.query);
    } catch (error) {
      const e = `Error parsing query: ${error}`;
      console.warn(e);
      res.status(400).send(e);
      return;
    }

    try {
      const gpsData = await $repos.location.getHistory(query);
      res.json(gpsData);
    } catch (error) {
      const e = `Error fetching data: ${error}`;
      console.error(e);
      res.status(500).send(e);
    }
  }
}

export default GPSData;
