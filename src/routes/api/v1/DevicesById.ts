import { Optional } from '../../../types';
import { Request, Response } from 'express';

import ApiV1Route from './Route';
import { AuthInfo, authenticate } from '../../../auth';
import { Forbidden, Unauthorized } from '../../../errors';
import { RoleName, UserDevice } from '../../../models';

class DevicesById extends ApiV1Route {
  constructor() {
    super('/devices/:deviceId');
  }

  private async authenticatedFetch(auth: AuthInfo, deviceId: string): Promise<UserDevice> {
    const device = await $repos.userDevices.get(deviceId);

    if (!device) {
      // Throw a 403 instead of a 404 to avoid leaking information
      throw new Forbidden('You do not have access to this device');
    }

    if (device.userId !== auth!.user.id) {
      try {
        authenticate([RoleName.Admin]);
      } catch (e) {
        throw new Unauthorized('You do not have access to this device');
      }
    }

    return device;
  }

  /**
   * GET /devices/:deviceId
   *
   * It returns a JSON object with the requested device.
   * Note that the device must be associated with the authenticated user,
   * unless the user is an admin.
   */
  @authenticate()
  get = async (req: Request, res: Response, auth: Optional<AuthInfo>) => {
    res.json(await this.authenticatedFetch(auth!, req.params.deviceId));
  }

  /**
   * PATCH /devices/:deviceId
   *
   * It updates the requested device.
   * Note that the device must be associated with the authenticated user,
   * unless the user is an admin.
   */
  @authenticate()
  patch = async (req: Request, res: Response, auth: Optional<AuthInfo>) => {
    const device = await this.authenticatedFetch(auth!, req.params.deviceId);
    const { name } = req.body;
    if (name) {
      device.name = name;
    }

    await device.save();
    res.json(device);
  }

  /**
   * DELETE /devices/:deviceId
   *
   * It deletes the requested device.
   * Note that the device must be associated with the authenticated user,
   * unless the user is an admin.
   */
  @authenticate()
  delete = async (req: Request, res: Response, auth: Optional<AuthInfo>) => {
    const device = await this.authenticatedFetch(auth!, req.params.deviceId);
    await device.destroy();
    res.status(204).send();
  }
}

export default DevicesById;
