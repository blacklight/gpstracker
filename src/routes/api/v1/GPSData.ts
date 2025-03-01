import { Request, Response } from 'express';

import { LocationRequest } from '../../../requests';
import LocationRepository from '~/repos/LocationRepository';
import ApiV1Route from './Route';

const $location: LocationRepository = globalThis.$repos.location;

class GPSData extends ApiV1Route {
  constructor() {
    super('/gpsdata');
  }

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
      const gpsData = await $location.getHistory(query);
      res.json(gpsData);
    } catch (error) {
      const e = `Error fetching data: ${error}`;
      console.error(e);
      res.status(500).send(e);
    }
  }
}

export default GPSData;
