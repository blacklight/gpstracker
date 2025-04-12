import { Request, Response } from 'express';

import { authenticate } from '../../../auth';
import { GPSPoint } from '../../../models';
import { LocationInfoProvider } from '../../../ext/location';
import ApiV1Route from './Route';

class LocationInfo extends ApiV1Route {
  private provider: LocationInfoProvider | undefined;

  constructor() {
    super('/location-info');
    this.provider = LocationInfoProvider.get();
  }

  @authenticate()
  get = async (req: Request, res: Response) => {
    if (!this.provider) {
      res.status(500).send('Location info provider not configured');
      return;
    }

    let location: GPSPoint;

    try {
      location = new GPSPoint(req.query);
      if (!(location?.latitude && location?.longitude)) {
        res.status(400).send('Invalid GPS coordinates');
        return;
      }
    } catch (error) {
      const e = `Error parsing location request: ${error}`;
      console.warn(e);
      res.status(400).send(e);
      return;
    }

    location = await this.provider.getLocationInfo(location);
    res.json(location);
  }
}

export default LocationInfo;
