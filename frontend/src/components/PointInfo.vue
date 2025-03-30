<template>
  <div class="popup" :class="{ hidden: !point }" ref="popup">
    <div class="popup-content" v-if="point">
      <div class="header">
        <button @click="$emit('close')" title="Close">✕</button>
      </div>
      <div class="point-info">
        <h2 class="address" v-if="point.address">{{ point.address }}</h2>
        <h2 class="latlng" v-else>
          <a :href="osmUrl" target="_blank" rel="noopener noreferrer">
            <font-awesome-icon icon="fas fa-map-marker-alt" />
            {{ point.latitude }}, {{ point.longitude }}
          </a>
        </h2>
        <p class="latlng" v-if="point.address">
          <a :href="osmUrl" target="_blank" rel="noopener noreferrer">
            <font-awesome-icon icon="fas fa-map-marker-alt" />
            {{ point.latitude }}, {{ point.longitude }}
          </a>
        </p>
        <p class="altitude" v-if="point.altitude">
          <font-awesome-icon icon="fas fa-mountain" />
          {{ Math.round(point.altitude) }} m
        </p>

        <form class="description editor" @submit.prevent="editPoint" v-if="editDescription">
          <div class="row">
            <textarea
              :value="point.description"
              @keydown.enter="editPoint"
              @blur="onDescriptionBlur"
              ref="description"
              placeholder="Enter a description" />

            <button type="submit" title="Save">
              <font-awesome-icon icon="fas fa-save" />
            </button>
          </div>
        </form>

        <p class="description"
           :class="{ 'no-content': !point.description?.length }"
           @click="editDescription = true"
           v-else>
          <span class="icon">
            <font-awesome-icon icon="fas fa-edit" />
          </span>
          <span class="text">
            {{ point.description?.length ? point.description : 'No description' }}
          </span>
        </p>

        <p class="device" v-if="device">
          <font-awesome-icon icon="fas fa-mobile-alt" />
          {{ device.name }}
        </p>

        <p class="battery" :style="{ color: batteryColor }" v-if="point.battery">
          <font-awesome-icon :icon="batteryIconClass" />
          <span>{{ point.battery }}%</span>
        </p>

        <p class="locality" v-if="point.locality">{{ point.locality }}</p>
        <p class="postal-code" v-if="point.postalCode">{{ point.postalCode }}</p>
        <p class="country" v-if="country">
          <span class="flag" v-if="countryFlag">{{ countryFlag }}&nbsp; </span>
          <span class="name">{{ country.name }}</span>,&nbsp;
          <span class="continent">{{ country.continent }}</span>
        </p>
        <p class="timestamp" v-if="timeString">{{ timeString }}</p>

        <div class="remove">
          <button title="Remove" @click="$emit('remove', point)">
            <font-awesome-icon icon="fas fa-trash-alt" />&nbsp; Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import type { TCountryCode } from 'countries-list';
import { getCountryData, getEmojiFlag } from 'countries-list';

import Dates from '../mixins/Dates.vue';
import GPSPoint from '../models/GPSPoint';
import UserDevice from '../models/UserDevice';

export default {
  emit: ['close', 'edit', 'remove'],
  mixins: [Dates],
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
      newValue: {} as GPSPoint,
      editDescription: false,
      popup: null as Overlay | null,
    }
  },

  computed: {
    batteryColor() {
      if (!this.point?.battery) {
        return null;
      }

      if (this.point.battery > 75) {
        return 'green';
      }

      if (this.point.battery > 66) {
        return '#7DFF2F';
      }

      if (this.point.battery > 50) {
        return '#D7D700';
      }

      if (this.point.battery > 25) {
        return 'orange';
      }

      if (this.point.battery > 15) {
        return '#FF4500';
      }

      return 'red';
    },

    batteryIconClass() {
      if (!this.point?.battery) {
        return null;
      }

      if (this.point.battery > 75) {
        return 'fas fa-battery-full';
      }

      if (this.point.battery > 50) {
        return 'fas fa-battery-three-quarters';
      }

      if (this.point.battery > 25) {
        return 'fas fa-battery-half';
      }

      if (this.point.battery > 15) {
        return 'fas fa-battery-quarter';
      }

      return 'fas fa-battery-empty';
    },

    country() {
      const cc = this.point?.country as string | undefined
      if (cc?.length) {
        return getCountryData(cc.toUpperCase() as TCountryCode)
      }

      return null
    },

    countryFlag() {
      return this.country ? getEmojiFlag(this.country.iso2 as TCountryCode) : null
    },

    osmUrl(): string {
      return `https://www.openstreetmap.org/?mlat=${this.point?.latitude}&mlon=${this.point?.longitude}`
    },

    timeString(): string | null {
      return this.formatDate(this.point?.timestamp)
    },
  },

  methods: {
    bindPopup(map: Map) {
      this.popup = new Overlay({
        element: this.$refs.popup as HTMLElement,
        autoPan: true,
      })

      // @ts-ignore
      map.addOverlay(this.popup)
    },

    editPoint() {
      this.newValue.description = (this.$refs.description as HTMLTextAreaElement).value
      this.$emit('edit', this.newValue)
      this.editDescription = false
    },

    onDescriptionBlur() {
      // Give it a moment to allow relevant click events to trigger
      setTimeout(() => {
        this.editDescription = false
      }, 100)
    },

    setPosition(coordinates: number[]) {
      if (this.popup) {
        this.popup.setPosition(coordinates)
      }
    },
  },

  watch: {
    point: {
      immediate: true,
      handler(point: GPSPoint | null) {
        if (point) {
          this.newValue = point
        }
      },
    },

    editDescription(edit: boolean) {
      if (edit) {
        this.$nextTick(() => {
          (this.$refs.description as HTMLTextAreaElement).focus()
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import "ol/ol.css";

.popup {
  position: absolute;
  background: var(--color-background);
  min-width: 20em;
  padding: 1em;
  border-radius: 1em;
  box-shadow: 2px 2px 2px 2px var(--color-border);

  .popup-content {
    display: flex;
    flex-direction: column;
    gap: 1.5em;
  }

  .header {
    position: absolute;
    top: 0.5em;
    right: 0;

    button {
      background: none;
      border: none;
      color: var(--color-heading);
      font-size: 1.2em;
      cursor: pointer;

      &:hover {
        color: var(--color-accent);
      }
    }
  }

  &.hidden {
    padding: 0;
    border-radius: 0;
    box-shadow: none;
    width: 0;
    height: 0;
    min-width: 0;
    pointer-events: none;
  }

  p.latlng, p.altitude {
    font-size: 0.8em;
    margin: -0.25em 0 0.25em 0;
  }

  .description {
    cursor: pointer;

    &:hover {
      .icon {
        color: var(--color-accent);
      }
    }

    .icon {
      margin-right: 0.5em;
    }

    .text {
      font-style: italic;
    }

    &:not(.no-content) {
      .text {
        font-weight: bold;
      }

      .icon {
        color: var(--color-accent);
      }
    }

    &.no-content {
      font-size: 0.9em;
      opacity: 0.5;
    }

    textarea {
      min-height: 5em;
    }

    button {
      background: var(--color-accent);
      border: none;
      color: var(--color-accent);
      font-size: 0.9em;
      margin: 0;
      padding: 0.5em 1.5em;
      cursor: pointer;

      &:hover {
        color: var(--color-heading);
      }
    }
  }

  .device {
    font-size: 0.9em;
    font-weight: bold;
    letter-spacing: 0.05em;
  }

  .battery {
    display: flex;
    align-items: center;
    font-weight: bold;

    span {
      margin-left: 0.25em;
    }
  }

  .timestamp {
    color: var(--color-heading);
    font-weight: bold;
    font-size: 0.9em;
  }

  .remove {
    font-size: 0.85em;
    margin-top: 0.5em;

    button {
      width: 100%;
      background: none;
      border: none;
      color: var(--vt-c-red-fg-light);
      margin-left: -0.5em;

      &:hover {
        color: var(--vt-c-red-fg-dark);
      }
    }
  }
}
</style>
