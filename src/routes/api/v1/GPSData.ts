import { Request, Response } from 'express';

import { authenticate } from '../../../auth';
import { AuthInfo } from '../../../auth';
import { LocationInfoProvider } from '../../../ext/location';
import { LocationRequest } from '../../../requests';
import { Optional } from '../../../types';
import { GPSPoint, RoleName } from '../../../models';
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

  private enrichWithLocationInfo = async (gpsData: GPSPoint[]) => {
    const provider = LocationInfoProvider.get();
    if (!provider) {
      return gpsData;
    }

    return await Promise.all(
      gpsData
        .map(async (point) => {
          // Only enrich points that have latitude and longitude, but no
          // location info
          if (
            !(point.latitude && point.longitude) ||
            (point.country && point.locality && point.address)
          ) {
            return point;
          }

          const locationInfo = await provider.getLocationInfo(point);
          return { ...point, ...locationInfo };
        })
    );
  }

  @authenticate()
  get = async (req: Request, res: Response, auth: Optional<AuthInfo>) => {
    let query: LocationRequest

    try {
      query = new LocationRequest(req.query);
      query.userId = auth!!.user.id;
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

    const points = await this.enrichWithLocationInfo(req.body as GPSPoint[]);
    console.log(`Storing ${points.length} location point${points.length > 1 ? 's' : ''}`);
    await $repos.location.createPoints(points);
    res.status(201).send();
  }

  @authenticate()
  patch = async (req: Request, res: Response, auth: Optional<AuthInfo>) => {
    const points = (req.body as GPSPoint[]).map((p) => {
      const descr = p.description?.trim()
      p.description = descr?.length ? descr : null;
      return p;
    });

    const deviceIds = points.map((p: any) => p.deviceId).filter((d: any) => !!d);
    this.validateOwnership(deviceIds, auth!);
    await $repos.location.updatePoints(points);
    res.status(204).send();
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
