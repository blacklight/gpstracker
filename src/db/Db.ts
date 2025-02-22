import { Sequelize, DataTypes, Dialect } from 'sequelize';

export class Db {
  private readonly url: string;
  private readonly locationTable: string;
  public readonly locationTableColumns: object;
  private readonly dialect: Dialect;
  private readonly sequelize: Sequelize;

  private static readonly envColumnPrefix = 'DB_LOCATION__';

  private constructor(
    opts: {
      url: string,
      locationTable: string,
      locationTableColumns: object,
      dialect: Dialect,
    }
  ) {
    this.url = opts.url;
    this.locationTable = opts.locationTable;
    this.locationTableColumns = opts.locationTableColumns
    this.dialect = opts.dialect as Dialect;

    this.sequelize = new Sequelize(this.url, {
      dialect: this.dialect,
      logging: process.env.DEBUG === 'true' ? console.log : false
    });
  }

  public static fromEnv(): Db {
    const opts: any = {}
    opts.url = process.env.DB_URL;
    opts.locationTable = process.env.DB_LOCATION_TABLE;
    opts.dialect = process.env.DB_DIALECT || opts.url.split(':')[0];

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

  public GpsData() {
    const typeDef: any = {};

    // @ts-expect-error
    typeDef[this.locationTableColumns['id']] = {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    };

    // @ts-expect-error
    typeDef[this.locationTableColumns['latitude']] = {
      type: DataTypes.FLOAT,
      allowNull: false
    };

    // @ts-expect-error
    typeDef[this.locationTableColumns['longitude']] = {
      type: DataTypes.FLOAT,
      allowNull: false
    };

    // @ts-expect-error
    const altitudeCol: string = this.locationTableColumns['altitude'];
    if (altitudeCol?.length) {
      typeDef[altitudeCol] = {
        type: DataTypes.FLOAT,
        allowNull: true
      };
    }

    // @ts-expect-error
    const addressCol: string = this.locationTableColumns['address'];
    if (addressCol?.length) {
      typeDef[addressCol] = {
        type: DataTypes.STRING,
        allowNull: true
      };
    }

    // @ts-expect-error
    const localityCol: string = this.locationTableColumns['locality'];
    if (localityCol?.length) {
      typeDef[localityCol] = {
        type: DataTypes.STRING,
        allowNull: true
      };
    }

    // @ts-expect-error
    const countryCol: string = this.locationTableColumns['country'];
    if (countryCol?.length) {
      typeDef[countryCol] = {
        type: DataTypes.STRING,
        allowNull: true
      };
    }

    // @ts-expect-error
    const postalCodeCol: string = this.locationTableColumns['postal_code'];
    if (postalCodeCol?.length) {
      typeDef[postalCodeCol] = {
        type: DataTypes.STRING,
        allowNull: true
      };
    }

    // @ts-expect-error
    typeDef[this.locationTableColumns['timestamp']] = {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    };

    return this.sequelize.define('GpsData', typeDef, {
      tableName: this.locationTable,
      timestamps: false
    });
  }
}
