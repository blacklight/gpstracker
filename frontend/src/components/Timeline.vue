<template>
  <div class="timeline-container">
    <h1 v-if="loading">Loading...</h1>
    <h1 v-else-if="!points.length">No data to display</h1>
    <div class="body" v-else>
      <div class="options-toggle until tablet">
        <button @click="optionsVisible = !optionsVisible"
                :title="(optionsVisible ? 'Hide' : 'Show') + ' options'"
                :class="{ selected: optionsVisible }">
          <font-awesome-icon icon="bars" />
        </button>
      </div>

      <div class="options-container from tablet">
        <TimelineOptions :showMetrics="showMetrics"
                         :hasBatteryInfo="hasBatteryInfo"
                         @show-metrics="$emit('show-metrics', $event)" />
      </div>

      <div class="options-container until tablet" v-if="optionsVisible">
        <TimelineOptions :showMetrics="showMetrics"
                         :hasBatteryInfo="hasBatteryInfo"
                         @show-metrics="$emit('show-metrics', $event)" />
      </div>

      <div class="page-button-container">
        <button @click="$emit('prev-page')"
                title="Previous results">
          <font-awesome-icon icon="chevron-left" />
        </button>
      </div>

      <div class="timeline">
        <Line :data="graphData" :options="graphOptions" />
      </div>

      <div class="page-button-container">
        <button @click="$emit('next-page')"
                title="Next results">
          <font-awesome-icon icon="chevron-right" />
        </button>
      </div>

      <div class="page-button-container reset-pagination"
           v-if="locationQuery?.minId || locationQuery?.maxId">
        <button @click="$emit('reset-page')"
                title="Reset pagination">
          <font-awesome-icon icon="fas fa-undo" />
        </button>
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
import LocationQuery from '../models/LocationQuery';
import TimelineMetricsConfiguration from '../models/TimelineMetricsConfiguration';
import TimelineOptions from './TimelineOptions.vue';

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
  emits: [
    'next-page',
    'point-hover',
    'prev-page',
    'reset-page',
    'show-metrics',
  ],

  mixins: [Geo],
  components: {
    Line,
    TimelineOptions,
  },

  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    locationQuery: {
      type: LocationQuery,
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

  data() {
    return {
      optionsVisible: false,
    }
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

    hasBatteryInfo(): boolean {
      return this.points.some((point: GPSPoint) => point.battery != null)
    },

    battery(): (number | null)[] {
      return this.points
        .map((point: GPSPoint) => point.battery ?? null)
    },

    speed(): number[] {
      if (!this.points.length) {
        return []
      }

      return this.points.map((point: GPSPoint, index: number) => {
        if (point.speed != null) {
          return point.speed
        }

        if (index === 0) {
          return 0
        }

        const distance = this.latLngToDistance(point, this.points[index - 1])
        const time = point.timestamp.getTime() - this.points[index - 1].timestamp.getTime()
        return 3.6 * distance / (time / 1000)
      })
    },

    graphData(): { labels: Date[], datasets: any[] } {
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

      if (this.showMetrics.battery) {
        datasets.push(
          {
            label: 'Battery (%)',
            backgroundColor: '#0989f8',
            borderColor: '#5959a8',
            fill: false,
            data: this.battery,
            yAxisID: 'percentage',
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

      if (this.showMetrics.battery) {
        let position = 'left'
        if (yAxes.meters || yAxes.speed) {
          position = 'right'
        }

        yAxes.percentage = {
          type: 'linear',
          position: position,
          display: true,
          min: 0,
          max: 100,
          ticks: {
            beginAtZero: true,
          },
          title: {
            display: true,
            text: 'Percentage',
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      }

      const xTicks = {} as { min?: Date, max?: Date }
      if (this.points.length > 1) {
        xTicks.min = this.points[0].timestamp
        xTicks.max = this.points[this.points.length - 1].timestamp
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
              tooltipFormat: 'MMM dd yyyy, HH:mm',
            },
            ticks: xTicks,
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

.options-toggle {
  position: absolute;
  width: 2em;
  height: 2em;
  z-index: 1;

  button {
    width: 100%;
    height: 100%;
    font-size: 1em;
    background-color: none;
    border: 0;
    cursor: pointer;

    &:hover {
      color: var(--color-hover);
    }

    &.selected {
      color: var(--color-accent);
    }
  }
}

.options-container {
  width: $options-width;
  height: 100%;
  padding: 0.5em;

  :deep(button) {
    font-size: 0.8em;
  }

  &.until.tablet {
    position: absolute;
    left: 2.5em;
    background-color: var(--color-background);
    box-shadow: 0.25em 0.25em 0.5em 0.1em var(--color-border);
  }
}

.page-button-container {
  width: 3em;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  button {
    width: 100%;
    height: 100%;
    font-size: 1em;
    background-color: var(--color-background);
    border: 0;
    margin-left: 0.5em;
    cursor: pointer;

    &:hover {
      color: var(--color-hover);
    }
  }
}

.reset-pagination {
  width: 2em;
  height: 2em;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
