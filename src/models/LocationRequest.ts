import { Nullable } from './Types';

class LocationRequest {
  limit: Nullable<number> = 10;
  offset: Nullable<number> = null;

  constructor(req: any) {
    if (req.limit != null) {
      this.limit = parseInt(req.limit);
      if (isNaN(this.limit)) {
        throw new TypeError('Invalid limit');
      }
    }

    if (req.offset != null) {
      this.offset = parseInt(req.offset);
      if (isNaN(this.offset)) {
        throw new TypeError('Invalid offset');
      }
    }
  }

  public toMap(): any {
    let map: any = {};

    if (this.limit != null) {
      map.limit = this.limit;
    }

    if (this.offset != null) {
      map.offset = this.offset;
    }

    map.order = [['created_at', 'DESC']];
    return map;
  }
}

export { LocationRequest };
