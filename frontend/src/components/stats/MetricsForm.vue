<template>
  <form class="metrics-form" @submit.prevent="$emit('submit', newMetrics)">
    <div class="metrics">
      <div v-for="enabled, metric in newMetrics" :key="metric" class="metric">
        <label :for="metric.toString()">
          <input
            type="checkbox"
            :id="metric.toString()"
            v-model="newMetrics[metric.toString()]"
          />&nbsp;
          {{ displayName(metric.toString()) }}
        </label>
      </div>
    </div>

    <div class="buttons">
      <button @click="$emit('close')">
        <font-awesome-icon icon="fa-solid fa-xmark" />&nbsp;
        Close
      </button>
      <button type="submit">
        <font-awesome-icon icon="fa-solid fa-check" />&nbsp;
        Apply
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import Text from '../../mixins/Text.vue';

export default {
  emits: ['close', 'submit'],
  mixins: [Text],
  props: {
    metrics: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      newMetrics: { ...this.metrics },
    }
  },
}
</script>

<style scoped lang="scss">
.metrics-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .metrics {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;

    .metric {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      label {
        display: flex;
        flex: 1;
      }

      input {
        margin-right: 0.5rem;
      }
    }
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;

    button {
      padding: 0.5rem 1rem;
    }
  }
}
</style>
