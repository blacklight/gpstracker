class LocationStats {
  public key: Record<string, any>;
  public count: number;
  public startDate: Date | undefined | null;
  public endDate: Date | undefined | null;

  constructor(data: {
    key: Record<string, any>;
    count: number;
    startDate?: Date | undefined | null;
    endDate?: Date | undefined | null;
  }) {
    this.key = data.key;
    this.count = data.count;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
  }
}

export default LocationStats;
