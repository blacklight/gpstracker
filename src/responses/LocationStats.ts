import {Optional} from "~/types";

class LocationStats {
  public key: Record<string, any>;
  public count: number;
  public startDate: Optional<Date>;
  public endDate: Optional<Date>;

  constructor(data: {
    key: Record<string, any>;
    count: number;
    startDate: Optional<Date>;
    endDate: Optional<Date>;
  }) {
    this.key = data.key;
    this.count = data.count;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
  }
}

export default LocationStats;
