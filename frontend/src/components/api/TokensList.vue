<template>
  <div class="list tokens-list">
    <h1>
      <font-awesome-icon icon="code" />
      API Tokens
    </h1>

    <ul>
      <li v-for="token in tokens" :key="token.id">
        <Token :token="token" @delete="$emit('delete', token)" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Token from './Token.vue';
import UserSession from '../../models/UserSession';

export default {
  emits: ['delete', 'update'],
  components: {
    Token,
  },

  props: {
    tokens: {
      type: Array as () => UserSession[],
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;
</style>
