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
    this.timestamp = record.timestamp;
  }
}

export default GPSPoint;
