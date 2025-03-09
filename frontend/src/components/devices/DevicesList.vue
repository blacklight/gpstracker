<template>
  <div class="devices-list">
    <h1>
      <font-awesome-icon icon="mobile-alt" />&nbsp;
      My devices
    </h1>

    <ul>
      <li v-for="device in devices" :key="device.id">
        <Device :device="device"
                @delete="$emit('delete', device)"
                @update="$emit('update', $event)" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Device from './Device.vue';
import UserDevice from '../../models/UserDevice';

export default {
  emits: ['delete', 'update'],
  components: {
    Device,
  },

  props: {
    devices: {
      type: Array as () => UserDevice[],
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.devices-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  @include media(tablet) {
    min-width: 30em;
  }

  h1 {
    width: 100%;
    text-align: center;
    padding: 0.5em 0;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    width: 100%;
    overflow-y: auto;
  }
}
</style>
