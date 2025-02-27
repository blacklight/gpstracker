class TimelineMetricsConfiguration {
  public altitude: boolean = false;
  public distance: boolean = true;
  public speed: boolean = false;

  constructor(data: any | null = null) {
    if (!data) {
      return;
    }

    for (const key of ['altitude', 'distance', 'speed']) {
      const value = String(
        data[key] ?? data['show' + key.charAt(0).toUpperCase() + key.slice(1)]
      )

      switch (value) {
        case '1':
        case 'true':
          // @ts-expect-error
          this[key] = true;
          break;
        case '0':
        case 'false':
          // @ts-expect-error
          this[key] = false;
          break;
      }
    }
  }

  toggleMetric(metric: string) {
    switch (metric) {
      case 'altitude':
        this.altitude = !this.altitude;
        break;
      case 'distance':
        this.distance = !this.distance;
        break;
      case 'speed':
        this.speed = !this.speed;
        break;
      default:
        throw new TypeError(`Invalid timeline metric: ${metric}`);
    }
  }

  toQuery(): Record<string, string> {
    return ['altitude', 'distance', 'speed'].reduce((acc: Record<string, string>, key: string) => {
      acc['show' + key.charAt(0).toUpperCase() + key.slice(1)] = String((this as any)[key]);
      return acc;
    }, {});
  }
}

export default TimelineMetricsConfiguration;
