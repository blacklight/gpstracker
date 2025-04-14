<script lang="ts">
import type { Optional } from '../models/Types';
import Country from '../models/Country';
import LocationStats from '../models/LocationStats';
import StatsRequest from '../models/StatsRequest';

export default {
  methods: {
    async getCountries(): Promise<Country[]> {
      return (
        await this.getStats(
          new StatsRequest({
            // @ts-ignore
            userId: this.$root.user.id,
            groupBy: ['country'],
            order: 'desc',
          })
        )
      )
      .filter((record: LocationStats) => !!record.key.country)
      .map((record: LocationStats) => Country.fromCode(record.key.country))
      .filter((country: Optional<Country>) => !!country)
    },
  },
}
</script>
