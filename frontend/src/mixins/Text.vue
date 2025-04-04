<script lang="ts">
export default {
  methods: {
    displayName(text: string) {
      if (!text?.length || text === 'undefined' || text === 'null' || text === 'None') {
        return '<missing>'
      }

      return text
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    },
  },
}
</script>
