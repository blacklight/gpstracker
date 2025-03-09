import { DataTypes, } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

function UserDevice(): Record<string, any> {
  return {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(),
    },
  };
}

export default UserDevice;
