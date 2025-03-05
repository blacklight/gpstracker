<template>
  <Loading />
</template>

<script lang="ts">
import Api from '../mixins/Api.vue';
import Loading from '../elements/Loading.vue';

export default {
  mixins: [Api],
  components: {
    Loading,
  },

  async mounted() {
    await this.logout();
  },
};
</script>
