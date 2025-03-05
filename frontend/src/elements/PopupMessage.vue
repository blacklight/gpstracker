<template>
  <div class="popup-message" :class="{ error: isError }" @click="$emit('click')">
    <div class="icon">
      <font-awesome-icon :icon="iconClass" />
    </div>

    <div class="message">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  emits: ['click'],
  props: {
    icon: {
      type: String,
      default: 'info-circle',
    },

    isError: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    iconClass() {
      const baseClass = this.isError ? 'triangle-exclamation' : this.icon;
      return `fas fa-${baseClass}`;
    },
  },
}
</script>

<style scoped lang="scss">
.popup-message {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.25rem;
  background-color: var(--default-popup-bg);
  font-size: 1rem;
  opacity: 0.9;
  box-shadow: 0 0 0.25rem 0.25rem var(--color-border);
  cursor: pointer;

  .icon {
    height: 100%;
    margin-right: 1rem;
    font-size: 1.5rem;
  }

  &.error {
    background: var(--color-error-bg);
    color: var(--vt-c-text-dark-1);
  }

  .icon {
    margin-right: 1rem;
  }

  &:hover {
    opacity: 1;
    box-shadow: 0 0 0.5rem 0.25rem #888;
  }

  .message {
    height: 100%;
    display: flex;
    flex: 1;
    align-items: center;
  }
}
</style>
