<template>
  <header v-if="user">
    <div class="wrapper">
      <nav>
        <li class="main">
          <RouterLink :to="{ name: 'home', hash: $route.hash }">
            <font-awesome-icon icon="map-marker-alt" />&nbsp;&nbsp;GPSTracker
          </RouterLink>
        </li>

        <div class="spacer" />

        <li class="right">
          <Dropdown>
            <template #button>
              <button class="options" title="Options">
                <font-awesome-icon icon="user" />
              </button>
            </template>

            <DropdownItem>
              <RouterLink to="/devices">
                <font-awesome-icon icon="mobile-alt" />&nbsp;&nbsp;
                <span class="item-text">Devices</span>
              </RouterLink>
            </DropdownItem>

            <DropdownItem>
              <RouterLink to="/api">
                <font-awesome-icon icon="code" />&nbsp;&nbsp;
                <span class="item-text">API</span>
              </RouterLink>
            </DropdownItem>

            <DropdownItem>
              <RouterLink to="/logout">
                <font-awesome-icon icon="sign-out-alt" />&nbsp;&nbsp;
                <span class="item-text">Logout</span>
              </RouterLink>
            </DropdownItem>
          </Dropdown>
        </li>
      </nav>
    </div>
  </header>
</template>

<script lang="ts">
import { RouterLink } from 'vue-router'

import { type Optional } from '../models/Types';
import Dropdown from '../elements/Dropdown.vue';
import DropdownItem from '../elements/DropdownItem.vue';
import User from '../models/User';

export default {
  components: {
    Dropdown,
    DropdownItem,
    RouterLink,
  },

  props: {
    user: {
      type: Object as () => Optional<User>,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
@use "@/styles/common.scss" as *;

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
          color: var(--color-accent);

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

      .logout-text {
        @include media(mobile) {
          display: none;
        }
      }
    }

    .spacer {
      flex: 1;
    }
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    margin-right: 0.5rem;
    padding: 0.25rem;
  }
}
</style>
