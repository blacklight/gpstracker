import type { Optional } from "./Types";

class GPSPoint {
  public id: number;
  public latitude: number;
  public longitude: number;
  public altitude?: Optional<number>;
  public deviceId: string;
  public address?: Optional<string>;
  public locality?: Optional<string>;
  public country?: Optional<string>;
  public postalCode?: Optional<string>;
  public description?: Optional<string>;
  public battery?: Optional<number>;
  public speed?: Optional<number>;
  public accuracy?: Optional<number>;
  public timestamp: Date;

  constructor(data: {
    id: number;
    latitude: number;
    longitude: number;
    altitude?: number;
    deviceId: string;
    address?: string;
    locality?: string;
    country?: string;
    postalCode?: string;
    description?: string;
    battery?: number;
    speed?: number;
    accuracy?: number;
    timestamp?: Date;
  }) {
    this.id = data.id;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.altitude = data.altitude;
    this.deviceId = data.deviceId;
    this.address = data.address;
    this.locality = data.locality;
    this.country = data.country;
    this.postalCode = data.postalCode;
    this.description = data.description;
    this.battery = data.battery;
    this.speed = data.speed;
    this.accuracy = data.accuracy;
    this.timestamp = data.timestamp || new Date();
  }

  public static fromLatLng({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) {
    return new GPSPoint({
      id: 0,
      latitude,
      longitude,
      deviceId: '',
    });
  }
}

export default GPSPoint;
