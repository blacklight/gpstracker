import { type Optional } from "./Types";

class LocationQuery {
  public limit: number = 500;
  public offset: Optional<number> = null;
  public deviceId: Optional<string> = null;
  public startDate: Optional<Date> = null;
  public endDate: Optional<Date> = null;
  public minId: Optional<number> = null;
  public maxId: Optional<number> = null;
  public country: Optional<string> = null;
  public locality: Optional<string> = null;
  public postalCode: Optional<string> = null;
  public order: string = 'asc';

  constructor(data: {
    limit?: Optional<number>;
    offset?: Optional<number>;
    deviceId?: Optional<string>;
    startDate?: Optional<Date>;
    endDate?: Optional<Date>;
    minId?: Optional<number>;
    maxId?: Optional<number>;
    country?: Optional<string>;
    locality?: Optional<string>;
    postalCode?: Optional<string>;
    order?: Optional<string>;
  }) {
    this.limit = data.limit || this.limit;
    this.offset = data.offset || this.offset;
    this.deviceId = data.deviceId || this.deviceId;
    this.startDate = data.startDate || this.startDate;
    this.endDate = data.endDate || this.endDate;
    this.minId = data.minId || this.minId;
    this.maxId = data.maxId || this.maxId;
    this.country = data.country || this.country;
    this.locality = data.locality || this.locality;
    this.postalCode = data.postalCode || this.postalCode;
    this.order = data.order || this.order;

    if (!(this.startDate && this.endDate)) {
      // Default to the past 24 hours
      this.endDate = new Date();
      this.startDate = new Date(this.endDate.getTime() - 24 * 60 * 60 * 1000);
    }
  }
}

export default LocationQuery;
