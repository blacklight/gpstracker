<template>
  <div class="device" @click="showDetails = !showDetails">
    <div class="loading-container" v-if="loading">
      <Loading />
    </div>

    <div class="header" :class="{ expanded: showDetails }">
      <h2>
        {{ device.name }}
      </h2>

      <div class="buttons wide" @click.stop>
        <button type="button" title="Edit" @click="showForm = true">
          <font-awesome-icon icon="edit" />&nbsp;
        </button>

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

          <DropdownItem @click="showForm = true">
            <template #icon>
              <font-awesome-icon icon="edit" />
            </template>
            Edit
          </DropdownItem>

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
          Device ID
        </div>
        <div class="value">
          {{ device.id }}
        </div>
      </div>

      <div class="row creation-date">
        <div class="property">
          Creation Date
        </div>
        <div class="value">
          {{ formatDate(device.createdAt) }}
        </div>
      </div>
    </div>
  </div>

  <Modal :visible="true" @close="clearForm" v-if="showForm">
    <template v-slot:title>
      Update device
    </template>

    <DeviceForm
        :device="device"
        @close="clearForm"
        @input="onUpdate" />
  </Modal>

  <ConfirmDialog
      :visible="showDeleteDialog"
      :disabled="loading"
      v-if="showDeleteDialog"
      @close="showDeleteDialog = false"
      @confirm="runDelete">
    <template #title>
      Delete device
    </template>

    <p>
      Are you sure you want to delete the device <b>{{ device.name }}</b>?<br />
      This action cannot be undone and all the data associated with this device will be lost.
    </p>
  </ConfirmDialog>
</template>

<script lang="ts">
import Api from '../../mixins/Api.vue';
import ConfirmDialog from '../../elements/ConfirmDialog.vue';
import Dates from '../../mixins/Dates.vue';
import DeviceForm from '../../components/devices/DeviceForm.vue';
import Dropdown from '../../elements/Dropdown.vue';
import DropdownItem from '../../elements/DropdownItem.vue';
import Loading from '../../elements/Loading.vue';
import Modal from '../../elements/Modal.vue';
import UserDevice from '../../models/UserDevice';

export default {
  emits: ['delete', 'update'],
  mixins: [
    Api,
    Dates,
  ],

  components: {
    ConfirmDialog,
    DeviceForm,
    Dropdown,
    DropdownItem,
    Loading,
    Modal,
  },

  props: {
    device: {
      type: Object as () => UserDevice,
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      showDeleteDialog: false,
      showDetails: false,
      showForm: false,
    }
  },

  methods: {
    async runDelete() {
      this.showDeleteDialog = false;
      this.loading = true;

      try {
        await this.deleteDevice(this.device.id);
        this.$emit('delete', this.device);
      } finally {
        this.loading = false;
      }
    },

    clearForm() {
      this.showForm = false;
    },

    onUpdate(device: UserDevice) {
      this.clearForm();
      this.$emit('update', device);
    },
  },
}
</script>

<style lang="scss" scoped>
@use "@/styles/common.scss" as *;

.device {
  width: 100%;
  margin: 0;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  font-size: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;

  @include media(tablet) {
    min-width: 30em;
  }

  .header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0.5em 0;

    &:hover {
      h2 {
        color: var(--color-hover);
      }
    }

    &.expanded {
      background-color: rgba(0, 0, 0, 0.05);
      font-weight: bold;
      padding: 0.5em;
      border-radius: 0.75rem;
    }
  }

  h2 {
    font-size: 1.25em;
    padding: 0.5em 0;
    flex: 1;
  }

  .buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    display: none;

    &.mobile {
      display: flex;
    }

    &.wide {
      display: none;
    }

    @include media(tablet) {
      &.mobile {
        display: none !important;
      }

      &.wide {
        display: flex !important;
      }
    }

    :deep(button) {
      background-color: transparent;
      color: var(--color-text);
      border: none;
      cursor: pointer;
      font-size: 1em;
      opacity: 0.75;

      &:hover {
        opacity: 1;
      }
    }
  }

  .details {
    cursor: initial;
    animation: fade-in 0.5s;
    padding: 0.5em 0;

    .row {
      display: flex;
      flex-direction: column;

      @include media(tablet) {
        flex-direction: row;
        justify-content: space-between;
      }

      &:hover {
        .property {
          color: var(--color-hover);
        }
      }

      .property {
        font-weight: bold;
        margin-bottom: 0.25em;

        @include media(tablet) {
          margin-bottom: 0;
        }
      }

      .value {
        font-size: 0.9em;
      }
    }
  }
}
</style>
