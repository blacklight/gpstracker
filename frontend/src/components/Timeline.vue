<template>
  <div class="timeline-container">
    <h1 v-if="loading">Loading...</h1>
    <h1 v-else-if="!points.length">No data to display</h1>
    <div class="body" v-else>
      <div class="options">
        <button @click="toggleMetric('altitude')"
                :class="{ selected: showMetrics.altitude }"
                :title="(showMetrics.altitude ? 'Hide' : 'Show') + ' altitude'">
          <font-awesome-icon icon="mountain" />
        </button>

        <button @click="toggleMetric('distance')"
                :class="{ selected: showMetrics.distance }"
                :title="(showMetrics.distance ? 'Hide' : 'Show') + ' distance'">
          <font-awesome-icon icon="ruler" />
        </button>

        <button @click="toggleMetric('speed')"
                :class="{ selected: showMetrics.speed }"
                :title="(showMetrics.speed ? 'Hide' : 'Show') + ' speed'">
          <font-awesome-icon icon="tachometer-alt" />
        </button>
      </div>

      <div class="timeline">
        <Line :data="graphData" :options="graphOptions" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';

import { Line } from 'vue-chartjs';
import 'chartjs-adapter-date-fns';

import Geo from '../mixins/Geo.vue';
import GPSPoint from '../models/GPSPoint';
import TimelineMetricsConfiguration from '../models/TimelineMetricsConfiguration';

ChartJS.register(
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
);

export default {
  emits: ['point-hover', 'show-metrics'],
  mixins: [Geo],
  components: {
    Line,
  },

  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    points: {
      type: Array as () => GPSPoint[],
      default: () => [],
    },
    showMetrics: {
      type: TimelineMetricsConfiguration,
      default: () => new TimelineMetricsConfiguration(),
    },
  },

  computed: {
    distances(): number[] {
      if (!this.points.length) {
        return []
      }

      return this.points.map((point: GPSPoint, index: number) => {
        if (index === 0) {
          return 0
        }

        return this.latLngToDistance(point, this.points[index - 1])
      })
    },

    speed(): number[] {
      if (!this.points.length) {
        return []
      }

      return this.points.map((point: GPSPoint, index: number) => {
        if (index === 0) {
          return 0
        }

        const distance = this.latLngToDistance(point, this.points[index - 1])
        const time = point.timestamp.getTime() - this.points[index - 1].timestamp.getTime()
        return 3.6 * distance / (time / 1000)
      })
    },

    graphData() {
      const datasets = []
      if (this.showMetrics.altitude) {
        datasets.push(
          {
            label: 'Altitude (m)',
            backgroundColor: '#7979f8',
            borderColor: '#5959a8',
            fill: false,
            data: this.points.map((point: GPSPoint) => point.altitude),
            yAxisID: 'meters',
          }
        )
      }

      if (this.showMetrics.distance) {
        datasets.push(
          {
            label: 'Distance (' + (this.showMetrics.altitude ? '' : 'k') + 'm)',
            backgroundColor: '#f87979',
            borderColor: '#a85959',
            fill: false,
            data: this.showMetrics.altitude ? this.distances : this.distances.map((distance: number) => distance / 1000),
            yAxisID: 'meters',
          }
        )
      }

      if (this.showMetrics.speed) {
        datasets.push(
          {
            label: 'Speed (km/h)',
            backgroundColor: '#79f879',
            borderColor: '#59a859',
            fill: false,
            data: this.speed,
            yAxisID: 'speed',
          }
        )
      }

      return {
        labels: this.points.map((point: GPSPoint) => point.timestamp),
        datasets: datasets,
      }
    },

    graphOptions(): any {
      const yAxes: Record<string, any> = []

      if (this.showMetrics.altitude || this.showMetrics.distance) {
        const text: string[] = []
        if (this.showMetrics.altitude) {
          text.push('Altitude')
        }

        if (this.showMetrics.distance) {
          text.push('Distance')
        }

        const unit = this.showMetrics.altitude ? 'm' : 'km'
        yAxes.meters = {
          type: 'linear',
          position: 'left',
          display: true,
          ticks: {
            beginAtZero: !this.showMetrics.distance,
          },
          title: {
            display: true,
            text: text.join(' / ') + ` (${unit})`,
          }
        }
      }

      if (this.showMetrics.speed) {
        yAxes.speed = {
          type: 'linear',
          position: yAxes.meters ? 'right' : 'left',
          display: true,
          ticks: {
            beginAtZero: true,
          },
          title: {
            display: true,
            text: 'Speed (km/h)',
          },
          ...(
            yAxes.length ? {
              grid: {
                // We only want the grid lines for one axis to show up
                drawOnChartArea: false,
              },
            } : {}
          )
        }
      }

      return {
        responsive: true,
        maintainAspectRatio: false,
        stacked: false,
        elements: {
          point: {
            borderWidth: 0,
            hoverRadius: 4,
            hoverBorderWidth: 2,
          },
          line: {
            tension: 0.5,
            borderWidth: 1,
            fill: false,
          }
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        onHover: (_: MouseEvent, activeElements: any) => {
          if (activeElements.length) {
            const index = activeElements[0].index;
            const point = this.points[index];
            this.$emit('point-hover', point);
          }
        },
        scales: {
          x: {
            type: 'time',
            grid: {
              drawOnChartArea: true,
              drawTicks: true,
            },
            time: {
              tooltipFormat: 'MMM dd, HH:mm',
              unit: 'minute',
            },
            title: {
              display: true,
              text: 'Date'
            },
          },
          ...yAxes,
        }
      }
    },
  },

  methods: {
    toggleMetric(metric: string) {
      this.$emit('show-metrics', {
        ...this.showMetrics,
        [metric]: !(this.showMetrics as any)[metric],
      });
    },
  },
}
</script>

<style scoped lang="scss">
$options-width: 5em;

.timeline-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.body {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
}

.timeline {
  width: calc(100% - #{$options-width});
  height: 100%;

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
}

.options {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  width: $options-width;
  height: 100%;
  margin-right: 1em;

  button {
    width: 100%;
    height: 2.5em;
    font-size: 1em;
    background-color: var(--color-background);
    border: 1px solid var(--vt-c-divider-light-1);
    margin-left: 0.5em;
    cursor: pointer;

    &:hover {
      color: var(--color-hover);
    }

    &.selected {
      background: var(--vt-c-blue-bg-dark);
      color: var(--vt-c-white);
    }
  }
}
</style>
