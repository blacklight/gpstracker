<script lang="ts">
import GPSPoint from '../models/GPSPoint';
import LocationQuery from '../models/LocationQuery';

// @ts-ignore
const baseURL = __API_PATH__

export default {
  methods: {
    async fetchPoints(query: LocationQuery): Promise<GPSPoint[]> {
      const response = await fetch(
        `${baseURL}/gpsdata?` + new URLSearchParams(
          Object.entries(query).reduce((acc: any, [key, value]) => {
            if (value != null && key != 'data') {
              acc[key] = value
            }

            if (value instanceof Date) {
              acc[key] = value.getTime()
            }

            return acc
          }, {})
        )
      )

      return (await response.json())
        .map((gps: any) => {
          return new GPSPoint(gps)
        })
    },
  },
}
</script>
