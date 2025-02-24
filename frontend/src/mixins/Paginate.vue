<script lang="ts">
import GPSPoint from '../models/GPSPoint';
import LocationQuery from '../models/LocationQuery';

export default {
  data() {
    return {
      gpsPoints: [] as GPSPoint[],
      hasNextPage: true,
      hasPrevPage: true,
      locationQuery: new LocationQuery({}),
    }
  },

  computed: {
    newestPoint(): GPSPoint | null {
      return this.gpsPoints[this.gpsPoints.length - 1] || null
    },

    oldestPoint(): GPSPoint | null {
      return this.gpsPoints[0] || null
    },
  },

  methods: {
    prevPageQuery(): LocationQuery | null {
      if (!this.oldestPoint) {
        return null
      }

      return new LocationQuery({
        ...this.locationQuery,
        minId: undefined,
        maxId: this.oldestPoint.id,
        // Previous page results should be retrieved in descending order
        order: 'desc',
      })
    },

    nextPageQuery(): LocationQuery | null {
      if (!this.newestPoint) {
        return null
      }

      return new LocationQuery({
        ...this.locationQuery,
        minId: this.newestPoint.id,
        maxId: undefined,
        order: 'asc',
      })
    },
  },
}
</script>
