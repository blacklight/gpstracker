<template>
  <div class="options desktop">
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

    <button @click="toggleMetric('battery')"
            :class="{ selected: showMetrics.battery }"
            :title="(showMetrics.battery ? 'Hide' : 'Show') + ' battery level'"
            v-if="hasBatteryInfo">
      <font-awesome-icon icon="battery-full" />
    </button>
  </div>
</template>

<script lang="ts">
import TimelineMetricsConfiguration from '../models/TimelineMetricsConfiguration';

export default {
  emits: [
    'show-metrics',
  ],

  props: {
    hasBatteryInfo: {
      type: Boolean,
      default: false,
    },
    showMetrics: {
      type: TimelineMetricsConfiguration,
      default: () => new TimelineMetricsConfiguration(),
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
.options {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  width: 100%;
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
