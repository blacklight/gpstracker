class GPSPoint {
  public id: number;
  public deviceId: string;
  public latitude: number;
  public longitude: number;
  public altitude: number | null;
  public address: string | null;
  public locality: string | null;
  public country: string | null;
  public postalCode: string | null;
  public description: string | null;
  public battery: number | null;
  public speed: number | null;
  public accuracy: number | null;
  public timestamp: Date;

  constructor(record: any) {
    this.id = record.id;
    this.deviceId = record.deviceId;
    this.latitude = record.latitude;
    this.longitude = record.longitude;
    this.altitude = record.altitude;
    this.address = record.address;
    this.locality = record.locality;
    this.country = record.country;
    this.postalCode = record.postalCode;
    this.description = record.description;
    this.battery = record.battery;
    this.speed = record.speed;
    this.accuracy = record.accuracy;
    this.timestamp = record.timestamp;
  }
}

export default GPSPoint;
