import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';

import { useGlobals } from './globals';
import Routes from './routes';

class App {
  private readonly app: express.Express;
  private readonly address: string;
  private readonly port: number;

  private constructor({
    app,
    address,
    port,
    routes,
  }: any) {
    useGlobals();
    $db.sync().then(() => {
      $repos.userRoles.init().then(() => {
        $repos.users.syncAdminUser().then(() => {
          console.log('  The database is ready');
        })
      })
    })

    this.app = app;
    this.address = address;
    this.port = port;

    app.use(cors());
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(express.static('frontend/dist'));
    routes.register(app)
  }

  public static fromEnv(): App {
    const address = process.env.BACKEND_ADDRESS || '127.0.0.1';
    const port = new Number(process.env.BACKEND_PORT || 3000).valueOf();
    const app = express();
    const routes = new Routes();

    return new App({
      app,
      address,
      port,
      routes,
    });
  }

  public listen(): void {
    this.app.listen(this.port, this.address, () => {
      console.log(`Server is running on port ${this.address}:${this.port}`);
    });
  }
}

export default App;
