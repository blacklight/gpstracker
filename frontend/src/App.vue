<template>
  <Login v-if="!user && !loading" />
  <div class="app-container" v-else>
    <Header :user="user" @logout="doLogout" v-if="user" />

    <div class="body">
      <div class="loading-container" v-if="loading">
        <Loading />
      </div>

      <div class="view-container" v-else>
        <RouterView />
      </div>
    </div>

    <Messages />
  </div>
</template>

<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import { type Optional } from './models/Types';
import Api from './mixins/Api.vue';
import Dropdowns from './mixins/Dropdowns.vue';
import Header from './components/Header.vue';
import Loading from './elements/Loading.vue';
import Login from './views/Login.vue';
import Messages from './components/Messages.vue'
import User from './models/User';

export default {
  mixins: [
    Api,
    Dropdowns,
  ],
  components: {
    Header,
    Loading,
    Login,
    Messages,
    RouterLink,
    RouterView,
  },

  data() {
    return {
      loading: false,
      user: null as Optional<User>,
    }
  },

  methods: {
    async doLogout() {
      await this.logout()
      this.user = null
    },
  },

  async mounted() {
    this.loading = true
    this.installDropdownHandler()

    try {
      const auth = await this.fetchUser()
      const currentRedirect = this.$route.query.redirect
      this.user = auth?.user

      if (auth) {
        if (currentRedirect?.length) {
          this.$router.push(currentRedirect as string)
        }
      } else {
        let redirect = '/login'
        if (currentRedirect?.length && currentRedirect !== '/login') {
          redirect += `?redirect=${currentRedirect}`
        } else if (this.$route.path !== '/login' && this.$route.path !== '/logout') {
          redirect += `?redirect=${this.$route.path}${this.$route.hash}`
        } else {
          redirect += '?redirect=/'
        }

        this.$router.push(redirect)
      }
    } finally {
      this.loading = false
    }
  },
}
</script>

<style lang="scss">
@use "@/styles/common.scss" as *;
</style>

<style lang="scss" scoped>
@use "@/styles/common.scss" as *;

.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);

  header {
    width: 100%;
    height: $header-height;
    margin-bottom: 0.2rem;
    padding: 0.5rem 0;
    box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.5);

    nav {
      display: flex;
      align-items: center;

      li {
        display: inline-block;
        list-style: none;
        border-radius: 0.25rem;

        &.main {
          font-size: 1.25rem;
          margin-left: 0.5rem;

          :deep(a) {
            &:hover {
              background: none;
              font-size: 1.5rem;
            }
          }

          &:hover {
            margin-top: -0.25rem;
          }
        }

        &:not(.main) {
          :deep(a) {
            color: var(--color-text);
            text-decoration: none;
          }
        }

        &.right {
          margin-right: 0.5rem;
        }
      }

      .spacer {
        flex: 1;
      }
    }
  }

  .body {
    width: 100%;
    height: calc(100% - #{$header-height});
    flex: 1;
    overflow-y: auto;
    position: relative;
  }

  .loading-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .view-container {
    width: 100%;
    height: 100%;
  }
}
</style>
