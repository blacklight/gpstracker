<template>
  <div class="timeline-container">
    <h1 v-if="loading">Loading...</h1>
    <h1 v-else-if="!points.length">No data to display</h1>
    <div class="timeline" v-else>
      <Line :data="graphData" :options="graphOptions" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';

import { Line } from 'vue-chartjs';
import 'chartjs-adapter-date-fns';

import GPSPoint from '../models/GPSPoint';

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
  emits: ['point-hover'],
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
  },

  computed: {
    graphData() {
      return {
        labels: this.points.map((point: GPSPoint) => point.timestamp),
        datasets: [
          {
            label: 'Altitude (m)',
            backgroundColor: '#7979f8',
            borderColor: '#5959a8',
            fill: false,
            data: this.points.map((point: GPSPoint) => point.altitude),
          }
        ]
      }
    },

    graphOptions(): any {
      return {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: {
            borderWidth: 1,
            hoverRadius: 4,
            hoverBorderWidth: 2,
          },
          line: {
            tension: 0.5,
            borderWidth: 2,
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
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Altitude (m)'
            },
          }
        }
      }
    },
  },
}
</script>

<style scoped lang="scss">
.timeline-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.timeline {
  width: 100%;
  height: 100%;

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
