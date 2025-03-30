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
  public battery?: number;
  public speed?: number;
  public accuracy?: number;
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
    battery,
    speed,
    accuracy,
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
    battery?: number;
    speed?: number;
    accuracy?: number;
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
    this.battery = battery;
    this.speed = speed;
    this.accuracy = accuracy;
    this.timestamp = timestamp;
  }
}

export default GPSPoint;
