<script lang="ts">
export default {
  methods: {
    displayDistance(distance: number) {
      if (distance < 1000) {
        return `${distance.toFixed(0)} m`
      }

      return `${(distance / 1000).toFixed(2)} km`
    },
  }
}
</script>
