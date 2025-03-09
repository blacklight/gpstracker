<script lang="ts">
export default {
  methods: {
    notify(payload: any) {
      // @ts-ignore
      this.$msgBus.emit('message', payload);
    },
  },
}
</script>
