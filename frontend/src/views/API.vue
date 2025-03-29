<template>
  <div class="api view">
    <div class="wrapper">
      <div class="loading-container" v-if="loading">
        <Loading />
      </div>

      <TokensList :tokens="tokens" @delete="onDelete" />
    </div>

    <Modal :visible="showTokenForm" @close="clearForm">
      <template v-slot:title>
        New API token
      </template>

      <TokenForm @close="clearForm" @input="refresh" />
    </Modal>

    <FloatingButton
        icon="fas fa-plus"
        title="Create a new API token"
        :primary="true"
        @click="showTokenForm = true" />
  </div>
</template>

<script lang="ts">
import Api from '../mixins/Api.vue';
import FloatingButton from '../elements/FloatingButton.vue';
import Loading from '../elements/Loading.vue';
import Modal from '../elements/Modal.vue';
import TokenForm from '../components/api/TokenForm.vue';
import TokensList from '../components/api/TokensList.vue';
import UserSession from '../models/UserSession';

export default {
  mixins: [Api],
  components: {
    FloatingButton,
    Loading,
    Modal,
    TokenForm,
    TokensList,
  },

  data() {
    return {
      loading: false,
      showTokenForm: false,
      tokens: [] as UserSession[],
    }
  },

  computed: {
    tokenIndexById() {
      return this.tokens.reduce(
        (acc: Record<string, number>, token: UserSession, index: number) => {
          acc[token.id] = index;
          return acc;
        }, {} as Record<string, number>
      );
    },
  },

  methods: {
    clearForm() {
      this.showTokenForm = false;
    },

    onDelete(token: UserSession) {
      const index = this.tokenIndexById[token.id];
      this.tokens.splice(index, 1);
    },

    async refresh() {
      this.loading = true;
      try {
        this.tokens = await this.getMyTokens()
      } finally {
        this.loading = false;
      }
    },
  },

  async mounted() {
    await this.refresh();
  },
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;
</style>
