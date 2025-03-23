class GPSPoint {
  public id: number;
  public latitude: number;
  public longitude: number;
  public altitude: number;
  public deviceId: string;
  public address: string;
  public locality: string;
  public country: string;
  public postalCode: string;
  public description?: string;
  public timestamp: Date;

  constructor({
    id,
    latitude,
    longitude,
    altitude,
    deviceId,
    address,
    locality,
    country,
    postalCode,
    description,
    timestamp,
  }: {
    id: number;
    latitude: number;
    longitude: number;
    altitude: number;
    deviceId: string;
    address: string;
    locality: string;
    country: string;
    postalCode: string;
    description?: string;
    timestamp: Date;
  }) {
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
    this.deviceId = deviceId;
    this.address = address;
    this.locality = locality;
    this.country = country;
    this.postalCode = postalCode;
    this.description = description;
    this.timestamp = timestamp;
  }
}

export default GPSPoint;
