<script lang="ts">
export default {
  methods: {
    formatDate(date: Date | number | string | null | undefined): string {
      if (!date) {
        return '-'
      }

      return new Date(date).toString().replace(/GMT.*/, '')
    },
  }
}
</script>
