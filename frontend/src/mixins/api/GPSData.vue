<script lang="ts">
import GPSPoint from '../../models/GPSPoint';
import LocationQuery from '../../models/LocationQuery';
import Common from './Common.vue';

export default {
  mixins: [Common],
  methods: {
    async fetchPoints(query: LocationQuery): Promise<GPSPoint[]> {
      const points = await this.request('/gpsdata', {
        query: query as Record<string, any>
      }) || []

      return points.map((gps: any) =>
          new GPSPoint({
            ...gps,
            // Normalize timestamp to Date object
            timestamp: new Date(gps.timestamp),
          })
        )
        .sort((a: GPSPoint, b: GPSPoint) => a.timestamp.getTime() - b.timestamp.getTime())
    },

    async deletePoints(points: GPSPoint[]) {
      await this.request('/gpsdata', {
        method: 'DELETE',
        body: points.map((point: GPSPoint) => point.id),
      })
    },
  },
}
</script>
