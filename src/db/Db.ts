import { Sequelize, Dialect } from 'sequelize';

import GPSData from './types/GPSData';

class Db {
  private readonly url: string;
  private readonly locationUrl: string;
  private readonly locationTable: string;
  public readonly locationTableColumns: Record<string, string>;
  private readonly dialect: Dialect;
  private readonly locationDialect: Dialect;
  private readonly appDb: Sequelize;
  private readonly locationDb: Sequelize;

  private static readonly envColumnPrefix = 'DB_LOCATION__';

  private constructor(
    opts: {
      url: string,
      locationUrl: string,
      locationTable: string,
      locationTableColumns: Record<string, string>,
      dialect: Dialect,
      locationDialect: Dialect | null,
    }
  ) {
    this.url = opts.url;
    this.locationUrl = opts.locationUrl;
    this.locationTable = opts.locationTable;
    this.locationTableColumns = opts.locationTableColumns
    this.dialect = opts.dialect as Dialect;
    this.locationDialect = (opts.locationDialect || this.dialect) as Dialect;

    this.appDb = new Sequelize(this.url, {
      dialect: this.dialect,
      logging: process.env.DEBUG === 'true' ? console.log : false
    });

    if (this.locationUrl === this.url) {
      this.locationDb = this.appDb;
    } else {
      this.locationDb = new Sequelize(this.locationUrl, {
        dialect: this.locationDialect,
        logging: process.env.DEBUG === 'true' ? console.log : false
      });
    }
  }

  public static fromEnv(): Db {
    const opts: any = {}
    opts.url = process.env.DB_URL;
    opts.locationUrl = process.env.DB_LOCATION_URL || opts.url;
    opts.locationTable = process.env.DB_LOCATION_TABLE;
    opts.dialect = process.env.DB_DIALECT || opts.url.split(':')[0];
    opts.locationDialect = process.env.DB_LOCATION_DIALECT || opts.locationUrl.split(':')[0];

    if (!opts.url?.length) {
      console.error('No DB_URL provided');
      process.exit(1);
    }

    if (!opts.locationTable?.length) {
      console.error('No LOCATION_TABLE provided');
      process.exit(1);
    }

    const requiredColumns = ['id', 'timestamp', 'latitude', 'longitude']
      .reduce((acc: any, name: string) => {
        acc[name] = true
        return acc;
      }, {});

    opts.locationTableColumns = [
      'id',
      'timestamp',
      'latitude',
      'longitude',
      'altitude',
      'address',
      'locality',
      'country',
      'postal_code'
    ].reduce((acc: any, name: string) => {
      acc[name] = process.env[this.prefixed(name)];
      if (!acc[name]?.length && requiredColumns[name]) {
        // Default to the name of the required field
        acc[name] = name;
      }

      return acc;
    }, {});

    return new Db(opts);
  }

  private static prefixed(name: string): string {
    return `${Db.envColumnPrefix}${name.toUpperCase()}`;
  }

  /**
   * Tables
   */

  public GPSData() {
    return this.locationDb.define('GPSData', GPSData(this.locationTableColumns), {
      tableName: this.locationTable,
      timestamps: false
    });
  }
}

export default Db;
