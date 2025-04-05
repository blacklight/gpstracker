<script lang="ts">
import _ from 'lodash'

import Dates from './Dates.vue'
import LocationQuery from '../models/LocationQuery'

export default {
  mixins: [Dates],
  methods: {
    isQueryChanged({
      newValue,
      oldValue,
    }: {
      newValue?: LocationQuery,
      oldValue?: LocationQuery,
    }): boolean {
      const values = [oldValue, newValue].map((value) =>
        Object.entries(value || {}).reduce((acc, [key, val]) => {
          // Replace all undefined values with null to avoid the comparison from breaking
          // when an attribute is not set and it's undefined on one side and null on the other
          acc[key] = val === undefined ? null : val

          // Normalize dates to avoid issues with different date formats
          if (key === 'startDate' || key === 'endDate') {
            acc[key] = this.normalizeDate(val)
          }

          return acc
        }, {} as Record<string, any>)
      )

      return !_.isEqual(values[0], values[1])
    },
  }
}
</script>
