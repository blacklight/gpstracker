import { Op } from 'sequelize';

import { Optional } from 'src/types';
import { Db } from 'src/db';
import { ValidationError } from '../errors';

type Order = 'ASC' | 'DESC';

class LocationRequest {
  userId: Optional<number> = null;
  deviceId: Optional<string> = null;
  limit: Optional<number> = 250;
  offset: Optional<number> = null;
  startDate: Optional<Date> = null;
  endDate: Optional<Date> = null;
  minId: Optional<number> = null;
  maxId: Optional<number> = null;
  minLatitude: Optional<number> = null;
  maxLatitude: Optional<number> = null;
  minLongitude: Optional<number> = null;
  maxLongitude: Optional<number> = null;
  country: Optional<string> = null;
  locality: Optional<string> = null;
  postalCode: Optional<string> = null;
  description: Optional<string> = null;
  orderBy: string = 'timestamp';
  order: Order = 'DESC';

  constructor(req: {
    userId?: number;
    deviceId?: string;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    minId?: number;
    maxId?: number;
    minLatitude?: number;
    maxLatitude?: number;
    minLongitude?: number;
    maxLongitude?: number;
    country?: string;
    locality?: string;
    postalCode?: string;
    description?: string;
    orderBy?: string;
    order?: string;
  }) {
    this.userId = req.userId;
    this.deviceId = req.deviceId?.length ? req.deviceId : this.deviceId;
    this.initNumber('limit', req);
    this.initNumber('offset', req);
    this.initDate('startDate', req);
    this.initDate('endDate', req);
    this.initNumber('minId', req);
    this.initNumber('maxId', req);
    this.initNumber('minLatitude', req, parseFloat);
    this.initNumber('maxLatitude', req, parseFloat);
    this.initNumber('minLongitude', req, parseFloat);
    this.initNumber('maxLongitude', req, parseFloat);
    this.country = req.country?.toLowerCase();
    this.locality = req.locality;
    this.postalCode = req.postalCode;
    this.description = req.description;
    this.orderBy = req.orderBy || this.orderBy;
    this.order = (req.order || this.order).toUpperCase() as Order;
  }

  private initNumber(key: string, req: any, parser: (s: string) => number = parseInt): void {
    if (req[key] != null) {
      const numValue = (this as any)[key] = parser(req[key]);
      if (isNaN(numValue)) {
        throw new ValidationError(`Invalid value for ${key}: ${req[key]}`);
      }
    }
  }

  private initDate(key: string, req: any): void {
    if (req[key] != null) {
      const numValue = (this as any)[key] = parseInt(req[key]);
      const dateValue = (this as any)[key] = new Date(isNaN(numValue) ? req[key] : numValue);
      if (isNaN(dateValue.getTime())) {
        throw new ValidationError(`Invalid value for ${key}: ${req[key]}`);
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

    if (this.deviceId != null) {
      const deviceIds = this.deviceId.split(/\s*,\s*/);
      where[db.locationTableColumns.deviceId || 'deviceId'] = {[Op.in]: deviceIds};
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
      where[colMapping.postalCode || 'postalCode'] = this.postalCode;
    }

    if (this.description != null) {
      where[colMapping.description || 'description'] = {[Op.like]: `%${this.description}%`};
    }

    if (this.minLatitude != null || this.maxLatitude != null) {
      const column = colMapping.latitude || 'latitude';
      const where_lat: any = where[column] = {};
      if (this.minLatitude == null && this.maxLatitude != null) {
        where_lat[Op.lte] = this.maxLatitude;
      } else if (this.minLatitude != null && this.maxLatitude == null) {
        where_lat[Op.gte] = this.minLatitude;
      } else {
        where_lat[Op.between] = [this.minLatitude, this.maxLatitude];
      }
    }

    if (this.minLongitude != null || this.maxLongitude != null) {
      const column = colMapping.longitude || 'longitude';
      const where_lon: any = where[column] = {};
      if (this.minLongitude == null && this.maxLongitude != null) {
        where_lon[Op.lte] = this.maxLongitude;
      } else if (this.minLongitude != null && this.maxLongitude == null) {
        where_lon[Op.gte] = this.minLongitude;
      } else {
        where_lon[Op.between] = [this.minLongitude, this.maxLongitude];
      }
    }

    queryMap.where = where;
    queryMap.order = [[colMapping[this.orderBy], this.order.toUpperCase()]];
    return queryMap;
  }
}

export default LocationRequest;
