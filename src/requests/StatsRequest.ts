type Order = 'ASC' | 'DESC';
type GroupBy = 'device' | 'country' | 'locality' | 'postalCode' | 'description';

class StatsRequest {
  userId: number;
  groupBy: GroupBy[];
  orderBy: string = 'count';
  order: Order = 'DESC';

  constructor(req: {
    userId: number;
    groupBy: string[] | string;
    orderBy?: string;
    order?: string;
  }) {
    this.userId = req.userId;
    this.groupBy = (
      typeof req.groupBy === 'string' ?
      req.groupBy.split(/\s*,\s*/) :
      req.groupBy
    ) as GroupBy[];

    this.orderBy = req.orderBy || this.orderBy;
    this.order = (req.order || this.order).toUpperCase() as Order;
  }
}

export default StatsRequest;
