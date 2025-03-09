<template>
  <form @submit.prevent="create" @input.stop.prevent>
    <div class="loading-container" v-if="loading">
      <Loading />
    </div>

    <div class="row" v-if="!token">
      <label for="name">
        (Optional) Enter a name to identify your token.
      </label>

      <input type="text" ref="name" placeholder="Token name" />
    </div>

    <div class="row" v-if="!token">
      <label for="expiresAt">
        (Optional) Expires at
      </label>

      <input type="datetime-local" ref="expiresAt" />
    </div>

    <div class="row" v-if="token">
      <label for="token">
        Your token<br />
        <small>Copy it now, you won't be able to see it again.</small>
      </label>

      <textarea type="text"
                readonly
                @click="tokenElement.select()"
                ref="token"
                v-model="token" />
    </div>

    <div class="row buttons" v-else>
      <button type="submit">
        Create token
      </button>

      <button type="button" @click="$emit('close')">
        Cancel
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { type Optional } from '../../models/Types';
import Api from '../../mixins/Api.vue';
import Loading from '../../elements/Loading.vue';
import Notifications from '../../mixins/Notifications.vue';

export default {
  emits: ['close', 'input'],
  mixins: [
    Api,
    Notifications,
  ],

  components: {
    Loading,
  },

  data() {
    return {
      expiresAt: null as Optional<string>,
      loading: false,
      token: null as Optional<string>,
    }
  },

  computed: {
    nameElement(): HTMLInputElement {
      return this.$refs.name as HTMLInputElement;
    },

    expiresAtElement(): HTMLInputElement {
      return this.$refs.expiresAt as HTMLInputElement;
    },

    tokenElement(): HTMLTextAreaElement {
      return this.$refs.token as HTMLTextAreaElement;
    },
  },

  methods: {
    async create() {
      let name = this.nameElement.value.trim() as Optional<string>;
      if (!name?.length) {
        name = null;
      }

      let expiresAt = this.expiresAtElement.value.trim() as Optional<string>;
      if (!expiresAt?.length) {
        expiresAt = null;
      }

      this.loading = true;
      try {
        this.token = await this.createToken(name, expiresAt ? new Date(expiresAt) : null);
        this.$emit('input', this.token);
      } finally {
        this.loading = false;
      }
    },
  },

  async mounted() {
    this.nameElement.focus();
  },
}
</script>

<style lang="scss" scoped>
form {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  position: relative;

  .row {
    margin-bottom: 0.5em;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 1em;

    button {
      height: 2.3em;
    }
  }

  textarea {
    width: 100%;
    height: 10em;
  }
}
</style>
