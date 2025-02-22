import { Nullable } from './Types';
import { Db } from '../db/Db';
import { Op } from 'sequelize';

class LocationRequest {
  limit: Nullable<number> = 250;
  offset: Nullable<number> = null;
  startDate: Nullable<Date> = null;
  endDate: Nullable<Date> = null;
  minId: Nullable<number> = null;
  maxId: Nullable<number> = null;
  country: Nullable<string> = null;
  locality: Nullable<string> = null;
  postalCode: Nullable<string> = null;
  orderBy: string = 'timestamp';
  order: string = 'DESC';

  constructor(req: any) {
    this.initNumber('limit', req);
    this.initNumber('offset', req);
    this.initDate('startDate', req);
    this.initDate('endDate', req);
    this.initNumber('minId', req);
    this.initNumber('maxId', req);
    this.country = req.country;
    this.locality = req.locality;
    this.postalCode = req.postalCode;
    this.orderBy = req.orderBy || 'timestamp';
  }

  private initNumber(key: string, req: any): void {
    if (req[key] != null) {
      const numValue = (this as any)[key] = parseInt(req[key]);
      if (isNaN(numValue)) {
        throw new TypeError(`Invalid value for ${key}: ${req[key]}`);
      }
    }
  }

  private initDate(key: string, req: any): void {
    if (req[key] != null) {
      const numValue = (this as any)[key] = parseInt(req[key]);
      const dateValue = (this as any)[key] = new Date(isNaN(numValue) ? req[key] : numValue);
      if (isNaN(dateValue.getTime())) {
        throw new TypeError(`Invalid value for ${key}: ${req[key]}`);
      }
    }
  }

  public toMap(db: Db): any {
    let queryMap: any = {};
    const where: any = {};

    if (this.limit != null) {
      queryMap.limit = this.limit;
    }

    if (this.offset != null) {
      queryMap.offset = this.offset;
    }

    const colMapping: any = db.locationTableColumns
    if (this.startDate != null || this.endDate != null) {
      const start = this.startDate == null ? 0 : this.startDate.getTime();
      const end = this.endDate == null ? new Date().getTime() : this.endDate.getTime();
      const column = colMapping.timestamp || 'timestamp';
      const where_t: any = where[column] = {};
      where_t[Op.between] = [start, end];
    }

    if (this.minId != null || this.maxId != null) {
      const column = colMapping.id || 'id';
      const where_id: any = where[column] = {};
      if (this.minId == null && this.maxId != null) {
        where_id[Op.lte] = this.maxId;
      } else if (this.minId != null && this.maxId == null) {
        where_id[Op.gte] = this.minId;
      } else {
        where_id[Op.between] = [this.minId, this.maxId];
      }
    }

    if (this.country != null) {
      where[colMapping.country || 'country'] = this.country;
    }

    if (this.locality != null) {
      where[colMapping.locality || 'locality'] = this.locality;
    }

    if (this.postalCode != null) {
      where[colMapping.postal_code || 'postal_code'] = this.postalCode;
    }

    queryMap.where = where;
    queryMap.order = [[colMapping[this.orderBy], this.order]];
    return queryMap;
  }
}

export { LocationRequest };
