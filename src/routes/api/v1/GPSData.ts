import { Request, Response } from 'express';

import { authenticate } from '../../../auth';
import { AuthInfo } from '../../../auth';
import { LocationRequest } from '../../../requests';
import { Optional } from '../../../types';
import { RoleName } from '../../../models';
import ApiV1Route from './Route';

class GPSData extends ApiV1Route {
  constructor() {
    super('/gpsdata');
  }

  private validateOwnership = async (deviceIds: string[], auth: AuthInfo) => {
    const user = auth.user;
    const notOwnedDevices = (await $repos.userDevices.getAll(deviceIds))
      .filter((d) => d.userId !== user.id);

    if (notOwnedDevices.length > 0) {
      authenticate([RoleName.Admin]);
    }
  };

  @authenticate()
  get = async (req: Request, res: Response) => {
    let query: LocationRequest

    try {
      // TODO Limit to the points that the user has access to
      query = new LocationRequest(req.query);
    } catch (error) {
      const e = `Error parsing query: ${error}`;
      console.warn(e);
      res.status(400).send(e);
      return;
    }

    const gpsData = await $repos.location.getHistory(query);
    res.json(gpsData);
  }

  @authenticate()
  post = async (req: Request, res: Response, auth: Optional<AuthInfo>) => {
    const deviceIds = req.body.map((p: any) => p.deviceId).filter((d: any) => !!d);
    this.validateOwnership(deviceIds, auth!);
    await $repos.location.createPoints(req.body);
    res.status(201).send();
  }

  @authenticate()
  delete = async (req: Request, res: Response, auth: Optional<AuthInfo>) => {
    const pointIds = req.body as number[];
    const points = await $repos.location.getByIds(pointIds);
    const deviceIds = points.map((p) => p.deviceId);
    this.validateOwnership(deviceIds, auth!);
    await $repos.location.deletePoints(pointIds);
    res.status(204).send();
  }
}

export default GPSData;
