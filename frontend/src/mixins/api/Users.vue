<script lang="ts">
import AuthInfo from '../../models/AuthInfo';
import Common from './Common.vue';

export default {
  mixins: [Common],
  methods: {
    async fetchUser(userId: string | number = 'me'): Promise<AuthInfo> {
      return (await this.request(`/users/${userId}`)) as AuthInfo;
    },
  },
}
</script>
