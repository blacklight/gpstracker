import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';

import { Db } from './db/Db';
import { LocationRequest } from './models/LocationRequest';
import { LocationRepository } from './repo/LocationRepository';

dotenv.config();

const app = express();
const db = Db.fromEnv();
const address = process.env.BACKEND_ADDRESS || '127.0.0.1';
const port = process.env.BACKEND_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('frontend/dist'));

// API route
app.get('/api/gpsdata', async (req, res) => {
  console.log(`[${req.ip}] GET ${req.originalUrl}`);
  let query: any = {};

  try {
    query = new LocationRequest(req.query);
  } catch (error) {
    const e = `Error parsing query: ${error}`;
    console.warn(e);
    res.status(400).send(e);
    return;
  }

  try {
    const gpsData = await new LocationRepository(db).getHistory(query);
    res.json(gpsData);
  } catch (error) {
    const e = `Error fetching data: ${error}`;
    console.error(e);
    res.status(500).send(e);
  }
});

// @ts-ignore
app.listen(port, address, () => {
  console.log(`Server is running on port ${address}:${port}`);
});
