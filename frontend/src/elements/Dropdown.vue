<template>
  <div class="dropdown">
    <button class="dropdown__button" @click="show">
      <slot name="button" />
    </button>

    <div class="dropdown__container" ref="container" @click="hide">
      <div class="dropdown__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  computed: {
    container() {
      return this.$refs.container as HTMLElement;
    },
  },

  methods: {
    hide() {
      this.container.classList.remove('show');
    },

    show() {
      this.container.classList.add('show');
    },
  },
}
</script>

<style lang="scss" scoped>
@use "@/styles/common.scss" as *;

.dropdown {
  position: relative;
  display: inline-block;

  &__button {
    background: none;
    border: none;
    cursor: pointer;
    margin: 0;

    &:focus,
    &:hover {
      color: var(--color-hover);
      outline: none;
    }
  }

  &__container {
    position: absolute;
    display: none;
    top: 100%;
    right: 0;
    z-index: 20;

    &.show {
      display: block;
    }
  }

  &__content {
    min-width: 10rem;
    display: flex;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.5);
    border-radius: 0.25rem;
    padding: 0.25rem;
    flex-direction: column;
    animation: dropdown 0.25s ease-out;
  }

  @keyframes dropdown {
    from {
      opacity: 0;
      transform: translateY(-0.5rem);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
