<script lang="ts">
import LocationStats from '../../models/LocationStats';
import StatsRequest from '../../models/StatsRequest';
import Common from './Common.vue';

export default {
  mixins: [Common],
  methods: {
    async getStats(query: StatsRequest): Promise<LocationStats[]> {
      return (
        await this.request('/stats', {
          query: query as Record<string, any>
        }) || []
      ).map((record: any) => new LocationStats(record));
    },
  },
}
</script>
