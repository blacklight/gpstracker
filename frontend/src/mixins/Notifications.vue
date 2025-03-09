<script lang="ts">
export default {
  methods: {
    notify(payload: any) {
      this.$msgBus.emit('message', payload);
    },
  },
}
</script>
