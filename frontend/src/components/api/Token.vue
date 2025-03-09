<template>
  <div class="token item" @click="showDetails = !showDetails">
    <div class="loading-container" v-if="loading">
      <Loading />
    </div>

    <div class="header" :class="{ expanded: showDetails }">
      <h2>
        {{ token.name?.length ? token.name : `Created on ${formatDate(token.createdAt)}` }}
      </h2>

      <div class="buttons wide" @click.stop>
        <button type="button" title="Delete" @click="showDeleteDialog = true">
          <font-awesome-icon icon="trash" />&nbsp;
        </button>

        <button type="button" title="Details" @click="showDetails = !showDetails">
          <font-awesome-icon icon="info-circle" />&nbsp;
        </button>
      </div>

      <div class="buttons mobile" @click.stop>
        <Dropdown>
          <template #button>
            <button class="options" title="Options">
              <font-awesome-icon icon="ellipsis-h" />
            </button>
          </template>

          <DropdownItem @click="showDeleteDialog = true">
            <template #icon>
              <font-awesome-icon icon="trash" />
            </template>
            Delete
          </DropdownItem>

          <DropdownItem @click="showDetails = !showDetails">
            <template #icon>
              <font-awesome-icon icon="info-circle" />
            </template>
            Details
          </DropdownItem>
        </Dropdown>
      </div>
    </div>

    <div class="details" v-if="showDetails" @click.stop>
      <div class="row">
        <div class="property">
          Token ID
        </div>
        <div class="value">
          {{ token.id }}
        </div>
      </div>

      <div class="row creation-date">
        <div class="property">
          Created at
        </div>
        <div class="value">
          {{ formatDate(token.createdAt) }}
        </div>
      </div>

      <div class="row creation-date">
        <div class="property">
          Expires at
        </div>
        <div class="value">
          {{ formatDate(token.expiresAt) }}
        </div>
      </div>
    </div>
  </div>

  <ConfirmDialog
      :visible="showDeleteDialog"
      :disabled="loading"
      v-if="showDeleteDialog"
      @close="showDeleteDialog = false"
      @confirm="runDelete">
    <template #title>
      Delete token
    </template>

    <p>
      Are you sure you want to delete this token?<br/>
      Any application using this token will stop working.
    </p>
  </ConfirmDialog>
</template>

<script lang="ts">
import Api from '../../mixins/Api.vue';
import ConfirmDialog from '../../elements/ConfirmDialog.vue';
import Dates from '../../mixins/Dates.vue';
import Dropdown from '../../elements/Dropdown.vue';
import DropdownItem from '../../elements/DropdownItem.vue';
import Loading from '../../elements/Loading.vue';
import UserSession from '../../models/UserSession';

export default {
  emits: ['delete'],
  mixins: [
    Api,
    Dates,
  ],

  components: {
    ConfirmDialog,
    Dropdown,
    DropdownItem,
    Loading,
  },

  props: {
    token: {
      type: Object as () => UserSession,
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      showDeleteDialog: false,
      showDetails: false,
    }
  },

  methods: {
    async runDelete() {
      this.showDeleteDialog = false;
      this.loading = true;

      try {
        await this.deleteToken(this.token.id);
        this.$emit('delete', this.token);
      } finally {
        this.loading = false;
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@use "@/styles/common.scss" as *;
</style>
