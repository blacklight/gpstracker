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
      return !_.isEqual(
        {
          ...(oldValue || {}),
          startDate: this.normalizeDate(oldValue?.startDate),
          endDate: this.normalizeDate(oldValue?.endDate),
        },
        {
          ...(newValue || {}),
          startDate: this.normalizeDate(newValue?.startDate),
          endDate: this.normalizeDate(newValue?.endDate),
        }
      )
    },
  }
}
</script>
