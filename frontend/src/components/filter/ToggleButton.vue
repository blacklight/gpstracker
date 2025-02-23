<template>
  <button class="toggle-button" :class="{ 'selected': value }"
          @click="$emit('input')"
          :title="title"
          :aria-pressed="value"
          :aria-label="title">
    <font-awesome-icon icon="fas fa-filter" />
  </button>
</template>

<script lang="ts">
export default {
  emits: ['input'],
  props: {
    value: Boolean,
  },

  computed: {
    title(): string {
      return this.value ? 'Hide filters' : 'Show filters'
    },
  },
};
</script>

<style lang="scss" scoped>
button.toggle-button {
  background: var(--color-background);
  color: var(--color-text);
  width: 4em;
  height: 4em;
  font-size: 1em;
  padding: 1.5em;
  outline: none;
  border: none;
  border-radius: 50%;
  box-shadow: 1px 1px 2px 2px var(--color-border);
  cursor: pointer;

  &.selected {
    background: var(--color-accent);
    color: var(--color-background);
    font-weight: bold;
    box-shadow: inset 1px 1px 2px 2px var(--color-accent);

    &:hover {
      color: var(--color-background) !important;
    }
  }
}
</style>
