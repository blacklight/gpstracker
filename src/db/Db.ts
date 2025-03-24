import { Sequelize, Dialect } from 'sequelize';

import Migrations from './Migrations';

import GPSData from './types/GPSData';
import Role from './types/Role';
import User from './types/User';
import UserDevice from './types/UserDevice';
import UserRole from './types/UserRole';
import UserSession from './types/UserSession';

class Db {
  public readonly url: string;
  public readonly locationUrl: string;
  public readonly locationTable: string;
  public readonly locationTableColumns: Record<string, string>;
  private readonly dialect: Dialect;
  private readonly locationDialect: Dialect;
  private readonly tablePrefix: string;
  private readonly appDb: Sequelize;
  private readonly locationDb: Sequelize;
  private readonly migrations: Migrations;

  private static readonly envColumnPrefix = 'DB_LOCATION__';

  private constructor(
    opts: {
      url: string,
      locationUrl: string,
      locationTable: string,
      locationTableColumns: Record<string, string>,
      dialect: Dialect,
      locationDialect: Dialect | null,
      tablePrefix?: string | null,
    }
  ) {
    this.url = opts.url;
    this.locationUrl = opts.locationUrl;
    this.locationTableColumns = opts.locationTableColumns
    this.dialect = opts.dialect as Dialect;
    this.locationDialect = (opts.locationDialect || this.dialect) as Dialect;
    this.tablePrefix = opts.tablePrefix || '';
    this.locationTable = opts.locationTable;

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

    this.migrations = new Migrations(this.appDb);
  }

  public static fromEnv(): Db {
    const opts: any = {}
    opts.url = process.env.DB_URL;
    opts.locationUrl = process.env.DB_LOCATION_URL || opts.url;
    opts.locationTable = process.env.DB_LOCATION_TABLE || 'location_history';
    opts.dialect = process.env.DB_DIALECT || opts.url.split(':')[0];
    opts.locationDialect = process.env.DB_LOCATION_DIALECT || opts.locationUrl.split(':')[0];
    opts.tablePrefix = process.env.DB_TABLE_PREFIX;

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
      'deviceId',
      'timestamp',
      'latitude',
      'longitude',
      'altitude',
      'address',
      'locality',
      'country',
      'postalCode',
      'description',
    ].reduce((acc: any, name: string) => {
      acc[name] = process.env[this.prefixedEnv(name)];
      if (!acc[name]?.length && (requiredColumns[name] || opts.locationUrl === opts.url)) {
        // Default to the name of the required field
        acc[name] = name;
      }

      return acc;
    }, {});

    return new Db(opts);
  }

  private static prefixedEnv(name: string): string {
    return `${Db.envColumnPrefix}${name.toUpperCase()}`;
  }

  public tableName(table: string): string {
    return `${this.tablePrefix}${table}`;
  }

  public async sync() {
    console.log('⌛ Syncing database');
    await this.migrations.up();
  }

  /**
   * Tables
   */

  public GPSData() {
    const tableDef = this.locationDb.define('GPSData', GPSData(this.locationTableColumns), {
      tableName: this.locationTable,
      timestamps: false,
    });

    tableDef.hasOne(this.UserDevice(), {
      sourceKey: this.locationTableColumns.deviceId,
      foreignKey: 'id',
      as: 'device',
    });

    return tableDef;
  }

  public Role() {
    const tableDef = this.appDb.define('Role', Role(), {
      tableName: this.tableName('roles'),
      timestamps: false,
    });

    return tableDef;
  }

  public User() {
    const tableDef = this.appDb.define('User', User(), {
      tableName: this.tableName('users'),
      timestamps: false,
    });

    return tableDef;
  }

  public UserDevice() {
    const tableDef = this.appDb.define('UserDevice', UserDevice(), {
      tableName: this.tableName('user_devices'),
      timestamps: false,
    });

    tableDef.belongsTo(this.User(), {
      foreignKey: 'userId',
      as: 'user',
    });

    return tableDef;
  }

  public UserRole() {
    const tableDef = this.appDb.define('UserRole', UserRole(), {
      tableName: this.tableName('users_roles'),
      timestamps: false,
    });

    tableDef.belongsTo(this.User(), {
      foreignKey: 'userId',
      as: 'user',
    });

    tableDef.belongsTo(this.Role(), {
      foreignKey: 'roleId',
      as: 'role',
    });

    return tableDef;
  }

  public UserSession() {
    const tableDef = this.appDb.define('UserSession', UserSession(), {
      tableName: this.tableName('user_sessions'),
      timestamps: false,
    });

    tableDef.belongsTo(this.User(), {
      foreignKey: 'userId',
      as: 'user',
    });

    return tableDef;
  }
}

export default Db;
