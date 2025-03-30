async function addLocationHistoryColumns(query: { context: any })  {
  const { DataTypes } = require('sequelize');

  await query.context.addColumn($db.locationTable, $db.locationTableColumns['battery'], {
    type: DataTypes.FLOAT,
    allowNull: true
  });

  await query.context.addColumn($db.locationTable, $db.locationTableColumns['speed'], {
    type: DataTypes.FLOAT,
    allowNull: true
  });

  await query.context.addColumn($db.locationTable, $db.locationTableColumns['accuracy'], {
    type: DataTypes.FLOAT,
    allowNull: true
  });
}

async function removeLocationHistoryColumns(query: { context: any }) {
  await query.context.removeColumn($db.locationTable, $db.locationTableColumns['battery']);
  await query.context.removeColumn($db.locationTable, $db.locationTableColumns['speed']);
  await query.context.removeColumn($db.locationTable, $db.locationTableColumns['accuracy']);
}

const addMetadataToLocationPoints = {
  up: async (query: { context: any }) => {
    await addLocationHistoryColumns({ context: query.context });
  },

  down: async (query: { context: any }) => {
    if ($db.locationUrl !== $db.url) {
      console.log('The location history table is stored on an external database, skipping deletion');
      return;
    }

    await removeLocationHistoryColumns({ context: query.context });
  },
}

module.exports = addMetadataToLocationPoints;
