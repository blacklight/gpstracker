<script lang="ts">
export default {
  methods: {
    formatDate(date: Date | number | string | null | undefined): string {
      if (!date) {
        return '-'
      }

      return new Date(date).toString().replace(/GMT.*/, '')
    },

    normalizeDate(date: any): Date | null {
      if (!date) {
        return null
      }

      if (typeof date === 'number' || typeof date === 'string') {
        date = new Date(date)
      }

      // Round to the nearest minute
      return new Date(Math.floor(date.getTime() / 60000) * 60000)
    },

    toLocalString(date: Date | string | number | null | undefined): string {
      const d = this.normalizeDate(date)
      if (!d) {
        return ''
      }

      return new Date(
        d.getTime() - (d.getTimezoneOffset() * 60000)
      ).toISOString().slice(0, -8)
    },
  }
}
</script>
