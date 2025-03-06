import { Sequelize, Dialect } from 'sequelize';

import GPSData from './types/GPSData';
import Role from './types/Role';
import User from './types/User';
import UserRole from './types/UserRole';
import UserSession from './types/UserSession';

class Db {
  private readonly url: string;
  private readonly locationUrl: string;
  private readonly locationTable: string;
  public readonly locationTableColumns: Record<string, string>;
  private readonly dialect: Dialect;
  private readonly locationDialect: Dialect;
  private readonly tablePrefix: string;
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
      'timestamp',
      'latitude',
      'longitude',
      'altitude',
      'address',
      'locality',
      'country',
      'postal_code'
    ].reduce((acc: any, name: string) => {
      acc[name] = process.env[this.prefixedEnv(name)];
      if (!acc[name]?.length && requiredColumns[name]) {
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
    console.log('Syncing databases');

    const gpsData = this.GPSData();
    const role = this.Role();
    const user = this.User();
    const userRole = this.UserRole();
    const userSession = this.UserSession();
    this.initConstraints();

    await gpsData.sync();
    await role.sync();
    await user.sync();
    await userRole.sync();
    await userSession.sync();

    await this.appDb.sync();
    console.log('Database sync completed');
  }

  private initConstraints() {
    this.appDb.models.UserSession.belongsTo(this.appDb.models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'user',
      onDelete: 'CASCADE'
    });

    this.appDb.models.User.hasMany(this.appDb.models.UserSession, {
      foreignKey: 'userId',
      sourceKey: 'id',
      as: 'sessions'
    });

    this.appDb.models.User.belongsToMany(this.appDb.models.Role, {
      through: this.appDb.models.UserRole,
      foreignKey: 'userId',
      otherKey: 'roleId',
      as: 'roles'
    });

    this.appDb.models.Role.belongsToMany(this.appDb.models.User, {
      through: this.appDb.models.UserRole,
      foreignKey: 'roleId',
      otherKey: 'userId',
      as: 'users'
    });

    this.appDb.models.UserSession.sync();
    this.appDb.sync();
  }

  /**
   * Tables
   */

  public GPSData() {
    return this.locationDb.define('GPSData', GPSData(this.locationTableColumns), {
      tableName: this.locationTable,
      timestamps: false,
    });
  }

  public Role() {
    return this.appDb.define('Role', Role(), {
      tableName: this.tableName('roles'),
      timestamps: false,
    });
  }

  public User() {
    return this.appDb.define('User', User(), {
      indexes: [
        {
          unique: true,
          fields: ['username', 'email'],
        },
      ],
      tableName: this.tableName('users'),
      timestamps: false,
    });
  }

  public UserRole() {
    return this.appDb.define('UserRole', UserRole(), {
      tableName: this.tableName('user_roles'),
      timestamps: false,
    });
  }

  public UserSession() {
    const ret = this.appDb.define('UserSession', UserSession(), {
      indexes: [
        {
          fields: ['userId'],
        },
      ],
      tableName: this.tableName('user_sessions'),
      timestamps: false,
    });

    return ret;
  }
}

export default Db;
