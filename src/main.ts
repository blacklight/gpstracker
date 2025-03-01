import cors from 'cors';
import express from 'express';

import { useGlobals } from './globals';
useGlobals();

import Routes from './routes';

const app = express();
const address = process.env.BACKEND_ADDRESS || '127.0.0.1';
const port = process.env.BACKEND_PORT || 3000;
const routes = new Routes();

app.use(cors());
app.use(express.static('frontend/dist'));
routes.register(app)

app.listen(new Number(port).valueOf(), address, () => {
  console.log(`Server is running on port ${address}:${port}`);
});
