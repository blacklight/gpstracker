import { type Optional } from "./Types";

class LocationQuery {
  public limit: number = 500;
  public offset: Optional<number> = null;
  public deviceId: Optional<string> = null;
  public startDate: Optional<Date> = null;
  public endDate: Optional<Date> = null;
  public minId: Optional<number> = null;
  public maxId: Optional<number> = null;
  public minLatitude: Optional<number> = null;
  public maxLatitude: Optional<number> = null;
  public minLongitude: Optional<number> = null;
  public maxLongitude: Optional<number> = null;
  public country: Optional<string> = null;
  public locality: Optional<string> = null;
  public postalCode: Optional<string> = null;
  public address: Optional<string> = null;
  public description: Optional<string> = null;
  public order: string = 'desc';

  constructor(data: {
    limit?: Optional<number>;
    offset?: Optional<number>;
    deviceId?: Optional<string>;
    startDate?: Optional<Date>;
    endDate?: Optional<Date>;
    minId?: Optional<number>;
    maxId?: Optional<number>;
    minLatitude?: Optional<number>;
    maxLatitude?: Optional<number>;
    minLongitude?: Optional<number>;
    maxLongitude?: Optional<number>;
    country?: Optional<string>;
    locality?: Optional<string>;
    postalCode?: Optional<string>;
    address?: Optional<string>;
    description?: Optional<string>;
    order?: Optional<string>;
  }) {
    this.limit = data.limit || this.limit;
    this.offset = data.offset || this.offset;
    this.deviceId = data.deviceId || this.deviceId;
    this.startDate = data.startDate || this.startDate;
    this.endDate = data.endDate || this.endDate;
    this.minId = data.minId || this.minId;
    this.maxId = data.maxId || this.maxId;
    this.minLatitude = data.minLatitude || this.minLatitude;
    this.maxLatitude = data.maxLatitude || this.maxLatitude;
    this.minLongitude = data.minLongitude || this.minLongitude;
    this.maxLongitude = data.maxLongitude || this.maxLongitude;
    this.country = data.country || this.country;
    this.locality = data.locality || this.locality;
    this.postalCode = data.postalCode || this.postalCode;
    this.address = data.address || this.address;
    this.description = data.description || this.description;
    this.order = data.order || this.order;
  }
}

export default LocationQuery;
