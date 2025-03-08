<template>
  <div class="dropdown__item" @click="$emit('click')">
    <div class="dropdown__item__icon">
      <slot name="icon" />
    </div>
    <div class="dropdown__item__text">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  emits: ['click'],
}
</script>

<style lang="scss" scoped>
.dropdown__item {
  display: flex;
  flex: 1;
  padding: 0.5rem 0;
  cursor: pointer;

  &:hover {
    color: var(--color-hover);

    :deep(a) {
      background-color: inherit;
      color: var(--color-hover);
    }
  }

  &__icon {
    margin-right: 0.5rem;
  }

  &__text {
    display: flex;
    flex: 1;

    :deep(a) {
      flex: 1;
      text-decoration: none;
    }
  }
}
</style>
