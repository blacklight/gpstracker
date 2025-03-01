import { DataTypes } from 'sequelize';

function GPSData(locationTableColumns: Record<string, string>): Record<string, any> {
  const typeDef: Record<string, any> = {};

  typeDef[locationTableColumns['id']] = {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  };

  typeDef[locationTableColumns['latitude']] = {
    type: DataTypes.FLOAT,
    allowNull: false
  };

  typeDef[locationTableColumns['longitude']] = {
    type: DataTypes.FLOAT,
    allowNull: false
  };

  const altitudeCol: string = locationTableColumns['altitude'];
  if (altitudeCol?.length) {
    typeDef[altitudeCol] = {
      type: DataTypes.FLOAT,
      allowNull: true
    };
  }

  const addressCol: string = locationTableColumns['address'];
  if (addressCol?.length) {
    typeDef[addressCol] = {
      type: DataTypes.STRING,
      allowNull: true
    };
  }

  const localityCol: string = locationTableColumns['locality'];
  if (localityCol?.length) {
    typeDef[localityCol] = {
      type: DataTypes.STRING,
      allowNull: true
    };
  }

  const countryCol: string = locationTableColumns['country'];
  if (countryCol?.length) {
    typeDef[countryCol] = {
      type: DataTypes.STRING,
      allowNull: true
    };
  }

  const postalCodeCol: string = locationTableColumns['postal_code'];
  if (postalCodeCol?.length) {
    typeDef[postalCodeCol] = {
      type: DataTypes.STRING,
      allowNull: true
    };
  }

  typeDef[locationTableColumns['timestamp']] = {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  };

  return typeDef;
}

export default GPSData;
