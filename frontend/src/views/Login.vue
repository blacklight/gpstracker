<template>
  <main>
    <Loading v-if="loading" />
    <form @submit.prevent="onSubmit">
      <h1 class="title">
        <font-awesome-icon icon="map-marker-alt" />
        GPSTracker
      </h1>

      <div class="row">
        <input type="text"
               placeholder="Username"
               v-model="username"
               :disabled="loading"
               ref="username" />
      </div>

      <div class="row">
        <input type="password"
               placeholder="Password"
               :disabled="loading"
               v-model="password" />
      </div>

      <div class="row">
        <button type="submit" :disabled="loading">
          <font-awesome-icon icon="sign-in-alt" />
          Login
        </button>
      </div>
    </form>
  </main>
</template>

<script lang="ts">
import Api from '../mixins/Api.vue';
import Loading from '../elements/Loading.vue';

export default {
  mixins: [Api],
  components: {
    Loading,
  },

  data() {
    return {
      loading: false,
      username: '',
      password: '',
    };
  },

  methods: {
    async onSubmit() {
      if (this.loading) {
        return;
      }

      this.loading = true;
      const redirect = this.$route.query.redirect || '/';

      try {
        const sessionToken = await this.login({
          username: this.username,
          password: this.password,
        });

        if (sessionToken?.length) {
          window.location.href = redirect as string;
        }
      } catch (error) {
        // @ts-ignore
        this.$msgBus.emit('message', {
          content: (error as any)?.message || error,
          isError: true,
        })
      } finally {
        this.loading = false;
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      (this.$refs.username as HTMLElement).focus();
    });
  },
};
</script>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: var(--vt-c-green-bg-light);
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 25em;
  max-width: 80%;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  box-shadow: 2px 2px 2px 2px var(--color-border);
  border-radius: 0.5em;
  padding: 1em;

  .row {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    padding: 0.5em;
  }
}
</style>
