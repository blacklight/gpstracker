const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

async function createLocationHistoryTable(query: { context: any }) {
  // Only create the table if locationUrl == appUrl (i.e. the location is stored
  // on the app managed database and not on an external one)
  if ($db.locationUrl !== $db.url) {
    console.log('The location history table is stored on an external database, skipping creation');
    return;
  }

  const typeDef: Record<string, any> = {
    [$db.locationTableColumns['id']]: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    [$db.locationTableColumns['latitude']]: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    [$db.locationTableColumns['longitude']]: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    [$db.locationTableColumns['timestamp']]: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
  }

  if ($db.locationTableColumns['altitude']) {
    typeDef[$db.locationTableColumns['altitude']] = {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }

  if ($db.locationTableColumns['address']) {
    typeDef[$db.locationTableColumns['address']] = {
      type: DataTypes.STRING,
      allowNull: true
    }
  }

  if ($db.locationTableColumns['locality']) {
    typeDef[$db.locationTableColumns['locality']] = {
      type: DataTypes.STRING,
      allowNull: true
    }
  }

  if ($db.locationTableColumns['country']) {
    typeDef[$db.locationTableColumns['country']] = {
      type: DataTypes.STRING,
      allowNull: true
    }
  }

  if ($db.locationTableColumns['postalCode']) {
    typeDef[$db.locationTableColumns['postalCode']] = {
      type: DataTypes.STRING,
      allowNull: true
    }
  }

  await query.context.createTable($db.locationTable, typeDef);
}

async function createUsersTable(query: { context: any }) {
  await query.context.createTable($db.tableName('users'), {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(),
    },
  });
}

async function createRolesTable(query: { context: any }) {
  await query.context.createTable($db.tableName('roles'), {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(),
    },
  });
}

async function createUsersRolesTable(query: { context: any }) {
  await query.context.createTable($db.tableName('users_roles'), {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: $db.tableName('users'),
        key: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: $db.tableName('roles'),
        key: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(),
    },
  });
}

async function createUserSessionsTable(query: { context: any }) {
  await query.context.createTable($db.tableName('user_sessions'), {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuidv4(),
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: $db.tableName('users'),
        key: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(),
    },
  });
}

async function createUserDevicesTable(query: { context: any }) {
  await query.context.createTable($db.tableName('user_devices'), {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: $db.tableName('users'),
        key: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }
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
  });
}

async function up(query: { context: any }) {
  await createRolesTable({ context: query.context });
  await createUsersTable({ context: query.context });
  await createUserDevicesTable({ context: query.context });
  await createUsersRolesTable({ context: query.context });
  await createUserSessionsTable({ context: query.context });
  await createLocationHistoryTable({ context: query.context });
}

async function down(query: { context: any }) {
  await query.context.dropTable($db.tableName('users'));
  await query.context.dropTable($db.tableName('roles'));
  await query.context.dropTable($db.tableName('user_devices'));
  await query.context.dropTable($db.tableName('users_roles'));
  await query.context.dropTable($db.tableName('user_sessions'));

  if ($db.locationUrl !== $db.url) {
    console.log('The location history table is stored on an external database, skipping deletion');
    return;
  }

  await query.context.dropTable($db.locationTable);
}

module.exports = {
  up,
  down
}
