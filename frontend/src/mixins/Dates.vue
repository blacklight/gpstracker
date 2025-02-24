<script lang="ts">
export default {
  methods: {
    displayDate(date: Date | number | string | null | undefined): string {
      if (!date) {
        return '-'
      }

      return new Date(date).toString().replace(/GMT.*/, '')
    },
  }
}
</script>
