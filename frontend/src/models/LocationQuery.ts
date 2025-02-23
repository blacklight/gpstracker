class LocationQuery {
  public limit: number = 250;
  public offset: number | null = null;
  public startDate: Date | null = null;
  public endDate: Date | null = null;
  public minId: number | null = null;
  public maxId: number | null = null;
  public country: string | null = null;
  public locality: string | null = null;
  public postalCode: string | null = null;
  public order: string = 'asc';

  constructor(public data: any) {
    this.limit = data.limit || this.limit;
    this.offset = data.offset || this.offset;
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
