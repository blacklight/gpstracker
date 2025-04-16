<template>
  <div class="modal-container" @click="close" v-if="visible">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h1>
          <slot name="title" />
        </h1>

        <button class="close" title="Close" @click="close">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  emits: ['close'],
  props: {
    visible: {
      type: Boolean,
    },
  },

  methods: {
    close() {
      this.$emit('close');
    },
  },
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;

  .modal {
    background-color: var(--color-background);
    border-radius: 0.5em;
    box-shadow: 0 0 1em rgba(0, 0, 0, 0.5);
    overflow: hidden;
    animation: fade-in 0.5s;

    @include until(tablet) {
      min-width: 90vw;
      max-width: 95vw;
    }

    @include from(tablet) {
      min-width: 500px;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.25em 1em;
      background-color: rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid var(--color-border);

      h1 {
        font-size: 1.25em;
        margin: 0;
      }

      .close {
        background: none;
        margin: 0;
        padding: 0.25em 0;
        cursor: pointer;
        font-size: 1.5em;
        border: none;
      }
    }

    .modal-body {
      padding: 1em;
      overflow-y: auto;
    }
  }
}
</style>
