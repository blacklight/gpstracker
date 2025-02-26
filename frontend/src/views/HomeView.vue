<script lang="ts">
import Map from '../components/Map.vue';

export default {
  components: {
    Map,
  },
};
</script>

<template>
  <main>
    <Map />
  </main>
</template>

<style lang="scss">
main {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
</style>
