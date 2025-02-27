<script lang="ts">
import GPSPoint from '../models/GPSPoint'

export default {
  methods: {
    latLngToDistance(p: GPSPoint, q: GPSPoint): number {
      const R = 6371e3 // metres
      const φ1 = p.latitude * Math.PI / 180 // φ, λ in radians
      const φ2 = q.latitude * Math.PI / 180
      const Δφ = (q.latitude - p.latitude) * Math.PI / 180
      const Δλ = (q.longitude - p.longitude) * Math.PI / 180

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      const dx = R * c // in metres

      // Take altitude into account if available for both points
      if (p.altitude && q.altitude) {
        const dy = p.altitude - q.altitude
        return Math.sqrt(dx * dx + dy * dy)
      }

      return dx
    },
  },
}
</script>
