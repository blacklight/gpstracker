<script lang="ts">
import { type Optional } from '../../models/Types';
import Common from './Common.vue';

export default {
  mixins: [Common],
  methods: {
    async login(payload: any): Promise<Optional<string>> {
      const response = await this.request(`/auth`, {
        method: 'POST',
        body: payload
      })

      return response?.session?.token;
    },

    async logout(): Promise<any> {
      await this.request(`/auth`, {
        method: 'DELETE',
      });

      this.$router.push('/login');
    },
  },
}
</script>
