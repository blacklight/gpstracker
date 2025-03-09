<template>
  <form @submit.prevent="sync" @input.stop.prevent>
    <div class="loading-container" v-if="loading">
      <Loading />
    </div>

    <div class="row">
      <label for="name">
        Enter a name for your device.
      </label>

      <input type="text"
             ref="name"
             placeholder="Device name"
             :value="device?.name" />
    </div>

    <div class="row buttons">
      <button type="submit">
        {{ device ? 'Update' : 'Register' }}
      </button>

      <button type="button" @click="$emit('close')">
        Cancel
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { Optional } from '../../models/Types';
import Api from '../../mixins/Api.vue';
import Loading from '../../elements/Loading.vue';
import Notifications from '../../mixins/Notifications.vue';
import UserDevice from '../../models/UserDevice';

export default {
  emits: ['close', 'input'],
  mixins: [
    Api,
    Notifications,
  ],

  components: {
    Loading,
  },

  props: {
    device: {
      type: Object as () => Optional<UserDevice>,
      default: null,
    },
  },

  data() {
    return {
      devices: [] as UserDevice[],
      loading: false,
    }
  },

  methods: {
    async sync() {
      const name = this.$refs.name.value.trim();
      if (!name?.length) {
        this.notify({
          content: 'Please enter a name for your device.',
          isError: true,
        });

        return;
      }

      this.loading = true;
      try {
        const device = this.device
            ? await this.updateDevice({
              ...this.device,
              name,
            })
            : await this.registerDevice(name);

        if (!device) {
          return;
        }

        this.$emit('input', device);
      } finally {
        this.loading = false;
      }
    },
  },

  async mounted() {
    this.$refs.name.focus();
  },
}
</script>

<style lang="scss" scoped>
form {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  position: relative;

  .buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 1em;

    button {
      height: 2.3em;
    }
  }
}
</style>
