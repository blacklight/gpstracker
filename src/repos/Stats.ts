import {LocationStats} from '../responses';
import {Sequelize} from 'sequelize';
import {StatsRequest} from '../requests';

class Stats {
  public async get(req: StatsRequest): Promise<LocationStats[]> {
    const dbColumnsToProps = req.groupBy.reduce((acc, g) => {
      acc[$db.locationTableColumns[g]] = g;
      return acc;
    }, {} as Record<string, string>);

    const groupBy = Object.keys(dbColumnsToProps);

    return (
      await $db.GPSData().findAll({
        attributes: [
          ...groupBy,
          [Sequelize.fn('COUNT', Sequelize.col($db.locationTableColumns.id)), 'count'],
          [Sequelize.fn('MIN', Sequelize.col($db.locationTableColumns.timestamp)), 'startDate'],
          [Sequelize.fn('MAX', Sequelize.col($db.locationTableColumns.timestamp)), 'endDate'],
        ],
        where: {
          deviceId: (await $db.UserDevice() .findAll({where: {userId: req.userId}}))
              .map((d) => d.dataValues.id)
        },
        group: groupBy,
        order: [[Sequelize.fn('COUNT', Sequelize.col($db.locationTableColumns.id)), req.order]],
      })
    ).map(({dataValues: data}: any) =>
      new LocationStats({
        key: groupBy.reduce((acc, k) => {
          acc[dbColumnsToProps[k] || k] = data[k];
          return acc;
        }, {} as Record<string, any>),
        count: data.count,
        startDate: data.startDate,
        endDate: data.endDate,
      })
    );
  }
}

export default Stats;
