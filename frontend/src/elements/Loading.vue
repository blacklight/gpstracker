<template>
  <div class="loading">
    <div class="loading__spinner" />
  </div>
</template>

<script lang="ts">
export default {
}
</script>

<style lang="scss" scoped>
.loading {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;

  &__spinner {
    width: 2em;
    height: 2em;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
