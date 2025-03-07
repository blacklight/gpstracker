import { Sequelize, } from 'sequelize';
import { Umzug, SequelizeStorage, } from 'umzug';

class Migrations {
  private readonly migrations: Umzug;

  constructor(db: Sequelize) {
    this.migrations = new Umzug({
      storage: new SequelizeStorage({ sequelize: db }),
      context: db.getQueryInterface(),
      migrations: {
        glob: 'src/db/migrations/*.*s',
      },
      logger: console,
    }) as Umzug;
  }

  public async up(): Promise<void> {
    await this.migrations.up();
  }
}

export default Migrations;
