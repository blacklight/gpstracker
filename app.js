const express = require('express');
const dotenv = require('dotenv');
const { Sequelize, DataTypes } = require('sequelize');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection using Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

// Define GPS model
const GpsData = sequelize.define('GpsData', {
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'location_history',
  timestamps: false
});

// Middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
  res.render('index')
});

app.get('/get', async (req, res) => {
  const apiResponse = await GpsData.findAll({
    limit: 1000,
    offset: 0,
  });

  const gpsData = apiResponse.map((p) => p.dataValues);
  res.json(gpsData);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
