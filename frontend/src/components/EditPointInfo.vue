<template>
  <form class="edit-point" @submit.prevent="$emit('edit', newValue)">
    <div class="content">
      <div class="row">
        <label for="id">
          <font-awesome-icon icon="fas fa-tag" />
          <span class="description">ID</span>
        </label>
        <span class="value">
          <input
            name="id"
            :value="point?.id"
            type="text"
            disabled />

          <span class="buttons">
            <button type="button"
                    title="Copy ID"
                    @click="copyToClipboard(point?.id?.toString() || '')">
              <font-awesome-icon icon="fas fa-copy" />
            </button>
          </span>
        </span>
      </div>

      <div class="row">
        <label for="description">
          <font-awesome-icon icon="fas fa-edit" />
          <span class="description">Description</span>
        </label>
        <span class="value">
          <!-- @vue-ignore -->
          <textarea name="description" v-model="newValue.description" placeholder="Enter a description" />
        </span>
      </div>
    </div>

    <div class="row">
      <label for="address">
        <font-awesome-icon icon="fas fa-map-marked-alt" />
        <span class="description">Address</span>
      </label>
      <span class="value">
        <input
            name="address"
            v-model="newValue.address"
            type="text"
            placeholder="Enter an address" />
      </span>
    </div>

    <div class="row">
      <label for="locality">
        <font-awesome-icon icon="fas fa-map-pin" />
        <span class="description">Locality</span>
      </label>
      <span class="value">
        <input
            name="locality"
            v-model="newValue.locality"
            type="text"
            placeholder="Enter a locality" />
      </span>
    </div>

    <div class="row">
      <label for="postalCode">
        <font-awesome-icon icon="fas fa-envelope" />
        <span class="description">Postal Code</span>
      </label>
      <span class="value">
        <input
            name="postalCode"
            v-model="newValue.postalCode"
            type="text"
            placeholder="Postal Code" />
      </span>
    </div>

    <div class="row">
      <label for="country">
        <font-awesome-icon icon="fas fa-flag" />
        <span class="description">Country</span>
      </label>
      <span class="value">
        <CountrySelector
            name="country"
            @input="newValue.country = $event"
            :value="newValue.country || ''"
            show-all />
      </span>
    </div>

    <div class="row">
      <label for="altitude">
        <font-awesome-icon icon="fas fa-mountain" />
        <span class="description">Altitude</span>
      </label>
      <span class="value">
        <input
            name="altitude"
            v-model="newValue.altitude"
            type="number"
            step="0.01"
            placeholder="Altitude" />
      </span>
    </div>

    <div class="buttons">
      <button type="submit"
              title="Save"
              :disabled="!hasChanged">
        Save
      </button>
      <button type="button"
              title="Cancel"
              @click="$emit('close')">
        Cancel
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import Clipboard from '../mixins/Clipboard.vue';
import CountrySelector from '../elements/CountrySelector.vue';
import GPSPoint from '../models/GPSPoint';
import UserDevice from '../models/UserDevice';

export default {
  emits: ['close', 'edit'],
  mixins: [Clipboard],
  components: {
    CountrySelector,
  },

  props: {
    device: {
      type: [UserDevice, null],
    },
    point: {
      type: [GPSPoint, null],
    },
  },

  data() {
    return {
      hasChanged: false,
      newValue: {...this.point} as GPSPoint,
    };
  },

  watch: {
    point: {
      handler(newValue: GPSPoint) {
        this.newValue = {...newValue} as GPSPoint;
      },
      immediate: true,
    },

    newValue: {
      handler(newValue: GPSPoint) {
        this.hasChanged = JSON.stringify(this.point) !== JSON.stringify(newValue);
      },
      deep: true,
    },
  },
}
</script>

<style lang="scss" scoped>
form {
  display: flex;
  flex-direction: column;
  // gap: 1rem;
  padding: 1rem;

  .row {
    margin-bottom: 0.5rem;

    label {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      color: var(--color-text);

      .description {
        opacity: 0.75;
      }

      svg {
        margin-right: 0.5rem;
        color: var(--color-accent);
      }
    }

    .value {
      $buttons-width: 2rem;
      display: flex;
      align-items: center;

      input, textarea {
        width: calc(100% - #{$buttons-width} - 1rem);
        padding: 0.5rem;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        background-color: var(--color-background);
        color: var(--color-text);
        font-size: 0.9rem;

        &:focus {
          border-color: var(--color-accent);
          outline: none;
        }
      }

      .buttons {
        width: $buttons-width;
        display: flex;
        align-items: center;
        margin: 0 0 0 0.5rem;
        padding: 0;

        button {
          height: 1.25rem;
          background: none;
          border: none;
          color: var(--color-accent);
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0;

          &:hover {
            color: var(--color-accent-hover);
          }

          &:active {
            color: var(--color-accent-active);
          }
        }
      }
    }
  }

  .buttons {
    font-size: 0.85rem;
    [type=submit] {
      background: var(--color-accent);
    }
  }
}
</style>
