import { GPSPoint } from '../models';
import { LocationRequest } from '../requests';

class Location {
  public async getHistory(query: LocationRequest): Promise<GPSPoint[]> {
    let apiResponse: any[] = [];

    try {
      apiResponse = await $db.GPSData().findAll(query.toMap($db));
    } catch (error) {
      throw new Error(`Error fetching data: ${error}`);
    }

    try {
      return apiResponse.map((p) => {
        const data = p.dataValues;
        const mappings: any = $db.locationTableColumns;

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

export default Location;
