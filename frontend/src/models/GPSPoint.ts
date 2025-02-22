class GPSPoint {
  public latitude: number;
  public longitude: number;
  public altitude: number;
  public address: string;
  public locality: string;
  public country: string;
  public postalCode: string;
  public timestamp: Date;

  constructor(public data: any) {
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.altitude = data.altitude;
    this.address = data.address;
    this.locality = data.locality;
    this.country = data.country;
    this.postalCode = data.postalCode;
    this.timestamp = data.timestamp;
  }
}

export default GPSPoint;
