<template>
  <div class="stats view">
    <div class="wrapper">
      <div class="header">
        <h1>
          <font-awesome-icon icon="chart-line" />&nbsp;
          Statistics
        </h1>

        <small v-if="stats.length">
          Showing <b>{{ stats.length }}</b> records
        </small>
      </div>

      <div class="loading-container" v-if="loading">
        <Loading />
      </div>

      <div class="list table-container" v-else>
        <table class="table" v-if="stats.length">
          <thead>
            <tr>
              <th class="key" v-for="attr in Object.keys(stats[0].key)" :key="attr">
                {{ displayName(attr) }}
              </th>
              <th class="count"># of records</th>
              <th class="date">First record</th>
              <th class="date">Last record</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stat, i in stats" :key="i">
              <td class="key" v-for="value, attr in stat.key" :key="attr">
                <a :href="mapURL(stat, { ascending: false })">
                  {{ displayValue(attr, value) }}
                </a>
              </td>
              <td class="count">{{ stat.count }}</td>
              <td class="date">
                <a :href="mapURL(stat, { ascending: true })">
                  {{ displayDate(stat.startDate) }}
                </a>
              </td>
              <td class="date">
                <a :href="mapURL(stat, { ascending: true })">
                  {{ displayDate(stat.endDate) }}
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="no-data" v-else>
          No data available
        </div>
      </div>
    </div>

    <Modal :visible="showSelectForm" @close="closeForm">
      <template v-slot:title>
        Select metrics
      </template>

      <MetricsForm
        :metrics="metrics"
        v-if="showSelectForm"
        @close="closeForm"
        @submit="onMetricsSubmit" />
    </Modal>

    <FloatingButton
        icon="fas fa-table"
        title="Select metrics"
        :primary="true"
        @click="showSelectForm = true" />
  </div>
</template>

<script lang="ts">
import Api from '../mixins/Api.vue';
import Country from '../models/Country';
import Dates from '../mixins/Dates.vue';
import FloatingButton from '../elements/FloatingButton.vue';
import Loading from '../elements/Loading.vue';
import LocationStats from '../models/LocationStats';
import MetricsForm from '../components/stats/MetricsForm.vue';
import Modal from '../elements/Modal.vue';
import StatsRequest from '../models/StatsRequest';
import Text from '../mixins/Text.vue';

export default {
  mixins: [
    Api,
    Dates,
    Text,
  ],

  components: {
    FloatingButton,
    Loading,
    Modal,
    MetricsForm,
  },

  data() {
    return {
      loading: false,
      metrics: {
        country: true,
        locality: false,
        address: false,
        postalCode: false,
        description: false,
      },
      showSelectForm: false,
      stats: [] as LocationStats[],
    }
  },

  computed: {
    query() {
      return new StatsRequest({
        // @ts-ignore
        userId: this.$root.user.id,
        groupBy: Object.entries(this.metrics)
          .filter(([_, enabled]) => enabled)
          .map(([metric]) => metric),
      })
    },
  },

  methods: {
    async refresh() {
      this.loading = true;
      try {
        this.stats = await this.getStats(this.query);
      } finally {
        this.loading = false;
      }
    },

    mapURL(stat: LocationStats, opts: {
      ascending?: boolean,
    }): string {
      const key = Object.entries(stat.key)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');

      return `/#${key}&order=${opts.ascending ? 'asc' : 'desc'}`
    },

    setURLQuery() {
      const enabledMetrics = Object.entries(this.metrics)
        .filter(([_, enabled]) => enabled)
        .map(([metric]) => metric);

      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}#groupBy=${enabledMetrics.sort().join(',')}`,
      );
    },

    setState() {
      const hash = window.location.hash;
      if (!hash) {
        return;
      }

      const params = new URLSearchParams(hash.slice(1));
      const groupBy = params.get('groupBy');
      if (!groupBy) {
        return;
      }

      const metrics = Object.fromEntries(
        Object.entries(this.metrics).map(([key]) => [key, false]),
      );

      for (const metric of groupBy.split(',')) {
        if (metrics[metric] !== undefined) {
          metrics[metric] = true;
        }
      }

      this.metrics = metrics as {
        country: boolean,
        locality: boolean,
        address: boolean,
        postalCode: boolean,
        description: boolean,
      };
    },

    closeForm() {
      this.showSelectForm = false;
    },

    onMetricsSubmit(newMetrics: Record<string, boolean>) {
      this.metrics = newMetrics as {
        country: boolean,
        locality: boolean,
        address: boolean,
        postalCode: boolean,
        description: boolean,
      };

      this.closeForm();
    },

    displayValue(key: string, value: any) {
      if (key === 'country') {
        return this.displayCountry(value);
      }

      if (value instanceof Date) {
        return this.displayDate(value);
      }

      return value;
    },

    displayCountry(countryCode?: string) {
      if (!countryCode?.length) {
        return "<missing>";
      }

      const country = Country.fromCode(countryCode);
      if (!country) {
        return countryCode;
      }

      return `${country.flag} ${country.name}`;
    },

    displayDate(date: Date | string | number | null | undefined) {
      return this.formatDate(date, { dayOfWeek: false, seconds: false });
    },
  },

  watch: {
    query: {
      handler() {
        this.setURLQuery();
        this.refresh();
      },
      deep: true,
    },
  },

  async created() {
    this.setState();
    this.setURLQuery();
    await this.refresh();
  },
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.stats.view {
  .wrapper {
    display: flex;
    padding: 1rem;
    flex-direction: column;
    align-items: center;

    @include until(desktop) {
      width: 100%;
      min-width: 100%;
      max-width: 100%;
    }

    @include from(desktop) {
      width: 80%;
      max-width: 1000px;
    }

    h1 {
      margin-bottom: 1rem;
    }
  }

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    small {
      margin: -1em 0 1em 0;
      opacity: 0.6;
    }
  }

  .list {
    .no-data {
      font-size: 1.2rem;
      margin: 1rem;
      text-align: center;
    }
  }

  table {
    tbody {
      tr {
        td {
          &.count {
            text-align: right;
            padding-right: 1.75rem;
            font-weight: bold;
            opacity: 0.8;
          }

          &.date {
            opacity: 0.6;
          }

          a {
            color: var(--color-accent);
          }
        }
      }
    }
  }
}
</style>
