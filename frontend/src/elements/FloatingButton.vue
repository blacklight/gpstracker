<template>
  <button class="floating-button"
          :class="{ primary }"
          @click="$emit('click')"
          :title="title"
          :style="style"
          :aria-label="title">
    <font-awesome-icon :icon="icon" />
  </button>
</template>

<script lang="ts">
export default {
  emits: ['click'],
  props: {
    icon: {
      type: String,
      required: true,
    },

    primary: {
      type: Boolean,
      default: false,
    },

    style: {
      type: Object,
      default: () => ({}),
    },

    title: {
      type: String,
    },
  },
};
</script>

<style lang="scss" scoped>
button.floating-button {
  position: fixed;
  bottom: 1em;
  right: 1em;
  width: 4em;
  height: 4em;
  font-size: 1em;
  padding: 1.5em;
  outline: none;
  border: none;
  border-radius: 50%;
  box-shadow: 1px 1px 2px 2px var(--color-border);
  cursor: pointer;
  z-index: 100;

  &:hover {
    font-weight: bold;
    filter: brightness(1.2);
  }

  &.primary {
    background: var(--color-accent);
    color: var(--color-background);

    &:hover {
      background: var(--color-accent) !important;
      color: var(--color-background) !important;
      font-weight: bold;
      filter: brightness(1.2);
    }
  }
}
</style>
