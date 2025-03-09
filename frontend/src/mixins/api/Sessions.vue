<script lang="ts">
import type { Optional } from '../../models/Types';
import UserSession from '../../models/UserSession';
import Common from './Common.vue';

export default {
  mixins: [Common],
  methods: {
    async getMyTokens(): Promise<UserSession[]> {
      return (
        await this.request(`/tokens`) as {
          tokens: UserSession[]
        }
      ).tokens;
    },

    async createToken(
      name: Optional<string> = null,
      expiresAt: Optional<Date> = null,
    ): Promise<string> {
      return (
        await this.request(`/tokens`, {
          method: 'POST',
          body: {
            name,
            expiresAt,
          },
        }) as { token: string }
      ).token;
    },

    async deleteToken(id: string): Promise<void> {
      await this.request(`/tokens/${id}`, { method: 'DELETE' });
    },
  },
}
</script>
