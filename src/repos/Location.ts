import { GPSPoint } from '../models';
import { LocationRequest } from '../requests';

class Location {
  public async getHistory(query: LocationRequest): Promise<GPSPoint[]> {
    let apiResponse: any[] = [];
    let dbQuery: any = query.toMap($db);

    if (query.userId) {
      dbQuery.include = [
        {
          model: $db.UserDevice(),
          as: 'device',
          required: true,
          where: {
            userId: query.userId
          }
        }
      ];
    }

    try {
      apiResponse = await $db.GPSData().findAll(dbQuery);
    } catch (error) {
      throw new Error(`Error fetching data: ${error}`);
    }

    try {
      return apiResponse.map((p) => {
        const data = p.dataValues;
        const mappings: any = $db.locationTableColumns;

        return new GPSPoint({
          id: data[mappings.id],
          deviceId: data[mappings.deviceId],
          latitude: data[mappings.latitude],
          longitude: data[mappings.longitude],
          altitude: data[mappings.altitude],
          address: data[mappings.address],
          locality: data[mappings.locality],
          country: data[mappings.country],
          postalCode: data[mappings.postalCode],
          description: data[mappings.description],
          battery: data[mappings.battery],
          speed: data[mappings.speed],
          accuracy: data[mappings.accuracy],
          timestamp: data[mappings.timestamp],
        });
      });
    } catch (error) {
      throw new Error(`Error parsing data: ${error}`);
    }
  }

  public async getByIds(ids: number[]): Promise<GPSPoint[]> {
    let apiResponse: any[] = [];

    try {
      apiResponse = await $db.GPSData().findAll({
        where: {
          id: ids
        }
      });
    } catch (error) {
      throw new Error(`Error fetching data: ${error}`);
    }

    try {
      return apiResponse.map((p) => {
        const data = p.dataValues;
        const mappings: any = $db.locationTableColumns;

        return new GPSPoint({
          id: data[mappings.id],
          deviceId: data[mappings.deviceId],
          latitude: data[mappings.latitude],
          longitude: data[mappings.longitude],
          altitude: data[mappings.altitude],
          address: data[mappings.address],
          locality: data[mappings.locality],
          country: data[mappings.country],
          postalCode: data[mappings.postalCode],
          description: data[mappings.description],
          battery: data[mappings.battery],
          speed: data[mappings.speed],
          accuracy: data[mappings.accuracy],
          timestamp: data[mappings.timestamp],
        });
      });
    } catch (error) {
      throw new Error(`Error parsing data: ${error}`);
    }
  }

  public async createPoints(points: GPSPoint[]): Promise<GPSPoint[]> {
    const mappings: any = $db.locationTableColumns;
    // Lowercase the keys of the mappings object -
    // some databases are case-insensitive and this will help with consistency
    const normalizedPoints = points.map((p) =>
      Object.entries(p).reduce((acc, [key, value]) => {
        acc[key.toLowerCase()] = value;
        return acc;
      } , {} as Record<string, any>)
    );

    try {
      return (
        await $db.GPSData().bulkCreate(
          normalizedPoints.map((p) => {
            return {
              [mappings.deviceId]: p.deviceid,
              [mappings.latitude]: p.latitude,
              [mappings.longitude]: p.longitude,
              [mappings.altitude]: p.altitude,
              [mappings.address]: p.address,
              [mappings.locality]: p.locality,
              [mappings.country]: p.country,
              [mappings.postalCode]: p.postalcode,
              [mappings.description]: p.description,
              [mappings.battery]: p.battery,
              [mappings.speed]: p.speed,
              [mappings.accuracy]: p.accuracy,
              [mappings.timestamp]: p.timestamp
            }
          },
          { returning: true }
        ))
      ).map((p) => {
        const data = p.dataValues;
        return new GPSPoint({
          id: data[mappings.id],
          deviceId: data[mappings.deviceId],
          latitude: data[mappings.latitude],
          longitude: data[mappings.longitude],
          altitude: data[mappings.altitude],
          address: data[mappings.address],
          locality: data[mappings.locality],
          country: data[mappings.country],
          postalCode: data[mappings.postalCode],
          description: data[mappings.description],
          battery: data[mappings.battery],
          speed: data[mappings.speed],
          accuracy: data[mappings.accuracy],
          timestamp: data[mappings.timestamp],
        });
      });
    } catch (error) {
      throw new Error(`Error saving data: ${error}`);
    }
  }

  public async updatePoints(points: GPSPoint[]): Promise<void> {
    const mappings: any = $db.locationTableColumns;
    // Lowercase the keys of the mappings object -
    // some databases are case-insensitive and this will help with consistency
    const normalizedPoints = points.map((p) =>
      Object.entries(p).reduce((acc, [key, value]) => {
        acc[key.toLowerCase()] = value;
        return acc;
      } , {} as Record<string, any>)
    );

    try {
      await $db.GPSData().bulkCreate(
        normalizedPoints.map((p) => {
          return {
            [mappings.id]: p.id,
            [mappings.deviceId]: p.deviceid,
            [mappings.latitude]: p.latitude,
            [mappings.longitude]: p.longitude,
            [mappings.altitude]: p.altitude,
            [mappings.address]: p.address,
            [mappings.locality]: p.locality,
            [mappings.country]: p.country,
            [mappings.postalCode]: p.postalcode,
            [mappings.description]: p.description,
            [mappings.battery]: p.battery,
            [mappings.speed]: p.speed,
            [mappings.accuracy]: p.accuracy,
            [mappings.timestamp]: p.timestamp
          }
        }),
        { updateOnDuplicate: Object.keys(mappings) }
      );
    } catch (error) {
      throw new Error(`Error updating data: ${error}`);
    }
  }

  public async deletePoints(points: number[]): Promise<void> {
    try {
      await $db.GPSData().destroy({
        where: {
          id: points
        }
      });
    } catch (error) {
      throw new Error(`Error deleting data: ${error}`);
    }
  }
}

export default Location;
