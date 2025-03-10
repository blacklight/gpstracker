import { Optional } from '~/types';
import { UserDevice } from '../models';

class UserDevices {
  public async get(deviceId: string): Promise<Optional<UserDevice>> {
    let dbDevice = await $db.UserDevice().findByPk(deviceId)
    if (!dbDevice) {
      dbDevice = await $db.UserDevice().findOne({
        where: { name: deviceId }
      });

      if (!dbDevice) {
        return null;
      }
    }

    return new UserDevice(dbDevice.dataValues);
  }

  public async getAll(deviceIds: string[]): Promise<UserDevice[]> {
    const dbDevices = await $db.UserDevice().findAll({
      where: {
        name: deviceIds,
      }
    });

    return dbDevices.map((d) => new UserDevice(d.dataValues));
  }

  public async create(name: string, args: {
    userId: number,
  }): Promise<UserDevice> {
    const device = await $db.UserDevice().create({
      userId: args.userId,
      name: name,
    });

    return new UserDevice(device.dataValues);
  }
}

export default UserDevices;
