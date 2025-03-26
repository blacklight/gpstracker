<script lang="ts">
import UserDevice from '../../models/UserDevice';
import Common from './Common.vue';

export default {
  mixins: [Common],
  methods: {
    async getMyDevices(): Promise<UserDevice[]> {
      return (
        await this.request(`/devices`) as {
          devices: UserDevice[]
        }
      ).devices.map((device) => new UserDevice(device));
    },

    async registerDevice(name: string): Promise<UserDevice> {
      return await this.request(`/devices`, {
        method: 'POST',
        body: { name },
      }) as UserDevice;
    },

    async updateDevice(device: UserDevice): Promise<UserDevice> {
      return await this.request(`/devices/${device.id}`, {
        method: 'PATCH',
        body: Object.keys(device).reduce((acc, key) => {
          if (!['id', 'userId', 'createdAt', 'updatedAt'].includes(key)) {
            acc[key] = (device as any)[key];
          }

          return acc;
        }, {} as Record<string, unknown>),
      }) as UserDevice;
    },

    async deleteDevice(id: string): Promise<void> {
      await this.request(`/devices/${id}`, { method: 'DELETE' });
    },
  },
}
</script>
