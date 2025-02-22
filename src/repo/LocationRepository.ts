import { Db } from '../db/Db';
import { GPSPoint } from '../models/GPSPoint';
import { LocationRequest } from 'src/models/LocationRequest';

export class LocationRepository {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  public async getHistory(query: LocationRequest): Promise<GPSPoint[]> {
    let apiResponse: any[] = [];

    try {
      apiResponse = await this.db.GpsData().findAll(query.toMap(this.db));
    } catch (error) {
      throw new Error(`Error fetching data: ${error}`);
    }

    try {
      return apiResponse.map((p) => {
        const data = p.dataValues;
        const mappings: any = this.db.locationTableColumns;

        return new GPSPoint({
          id: data[mappings.id],
          latitude: data[mappings.latitude],
          longitude: data[mappings.longitude],
          altitude: data[mappings.altitude],
          address: data[mappings.address],
          locality: data[mappings.locality],
          country: data[mappings.country],
          postalCode: data[mappings.postal_code],
          timestamp: data[mappings.timestamp],
        });
      });
    } catch (error) {
      throw new Error(`Error parsing data: ${error}`);
    }
  }
}
