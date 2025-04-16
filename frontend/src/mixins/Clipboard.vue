<script lang="ts">
import Notifications from './Notifications.vue'

export default {
  mixins: [Notifications],
  methods: {
    async copyToClipboard(text: string) {
      await navigator.clipboard.writeText(text)
      this.notify({
        content: 'Copied to the clipboard',
        icon: 'copy',
      })
    },
  },
}
</script>
