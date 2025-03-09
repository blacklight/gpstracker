<template>
  <Modal :visible="visible" @close="$emit('close')">
    <template #title>
      <slot name="title" />
    </template>

    <form class="confirm-dialog" @submit.prevent="$emit('confirm')">
      <div class="content">
        <slot />
      </div>
      <div class="buttons">
        <button type="submit" @click="$emit('confirm')" :disabled="disabled">Confirm</button>
        <button type="button" @click="$emit('close')" :disabled="disabled">Cancel</button>
      </div>
    </form>
  </Modal>
</template>

<script lang="ts">
import Modal from './Modal.vue';

export default {
  emits: ['close', 'confirm'],
  components: {
    Modal,
  },
  mixins: [
    Modal,
  ],

  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
