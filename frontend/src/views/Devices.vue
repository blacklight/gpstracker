<template>
  <div class="devices view">
    <div class="wrapper">
      <div class="loading-container" v-if="loading">
        <Loading />
      </div>

      <DevicesList :devices="devices"
                   @delete="onDelete"
                   @update="onUpdate" />
    </div>

    <Modal :visible="showDeviceForm" @close="clearForm">
      <template v-slot:title>
        Register a new device
      </template>

      <DeviceForm
          @close="clearForm"
          @input="addDevice" />
    </Modal>

    <FloatingButton
        icon="fas fa-plus"
        title="Register a new device"
        :primary="true"
        @click="showDeviceForm = true" />
  </div>
</template>

<script lang="ts">
import DeviceForm from '../components/devices/DeviceForm.vue';
import Api from '../mixins/Api.vue';
import DevicesList from '../components/devices/DevicesList.vue';
import FloatingButton from '../elements/FloatingButton.vue';
import Loading from '../elements/Loading.vue';
import Modal from '../elements/Modal.vue';
import UserDevice from '../models/UserDevice';

export default {
  mixins: [Api],
  components: {
    DeviceForm,
    DevicesList,
    FloatingButton,
    Loading,
    Modal,
  },

  data() {
    return {
      devices: [] as UserDevice[],
      loading: false,
      showDeviceForm: false,
    }
  },

  computed: {
    deviceIndexById() {
      return this.devices.reduce(
        (acc: Record<string, number>, device: UserDevice, index: number) => {
          acc[device.id] = index;
          return acc;
        }, {} as Record<string, number>
      );
    },
  },

  methods: {
    addDevice(device: UserDevice) {
      this.devices.push(device);
      this.clearForm();
    },

    clearForm() {
      this.showDeviceForm = false;
    },

    onDelete(device: UserDevice) {
      const index = this.deviceIndexById[device.id];
      this.devices.splice(index, 1);
    },

    onUpdate(device: UserDevice) {
      const index = this.deviceIndexById[device.id];
      this.devices[index] = device;
    },
  },

  async mounted() {
    this.loading = true;
    try {
      this.devices = await this.getMyDevices();
    } finally {
      this.loading = false;
    }
  },
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;
</style>
