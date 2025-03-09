import { Optional } from '../../../types';
import { Request, Response } from 'express';

import ApiV1Route from './Route';
import { AuthInfo, authenticate } from '../../../auth';
import { BadRequest } from '../../../errors';

class Devices extends ApiV1Route {
  constructor() {
    super('/devices');
  }

  /**
   * GET /devices
   *
   * It returns a JSON object of devices associated with the authenticated user,
   * in the format `{ devices: UserDevice[] }`.
   */
  @authenticate()
  get = async (_: Request, res: Response, auth: Optional<AuthInfo>) => {
    res.json({
      devices: (await auth!.user.devices()),
    });
  }

  /**
   * POST /devices
   *
   * It creates a new device associated with the authenticated user.
   * It expects a JSON object with the following properties:
   * - `name` (string): The name of the device.
   *   It must be unique for the user.
   */
  @authenticate()
  post = async (req: Request, res: Response, auth: Optional<AuthInfo>) => {
    const { name } = req.body;

    if (!name) {
      throw new BadRequest('Missing name');
    }

    const device = await $repos.userDevices.create(name, { userId: auth!.user.id });
    res.json(device);
  }
}

export default Devices;
