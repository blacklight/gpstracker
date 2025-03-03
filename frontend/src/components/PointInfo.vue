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
        <p class="locality" v-if="point.locality">{{ point.locality }}</p>
        <p class="postal-code" v-if="point.postalCode">{{ point.postalCode }}</p>
        <p class="country" v-if="country">
          <span class="flag" v-if="countryFlag">{{ countryFlag }}&nbsp; </span>
          <span class="name">{{ country.name }}</span>,&nbsp;
          <span class="continent">{{ country.continent }}</span>
        </p>
        <p class="timestamp" v-if="timeString">{{ timeString }}</p>
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

export default {
  emit: ['close'],
  mixins: [Dates],
  props: {
    point: {
      type: [GPSPoint, null],
    },
  },

  data() {
    return {
      popup: null as Overlay | null,
    }
  },

  computed: {
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
      return this.displayDate(this.point?.timestamp)
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

    setPosition(coordinates: number[]) {
      if (this.popup) {
        this.popup.setPosition(coordinates)
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
    right: 0.5em;

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

  .timestamp {
    color: var(--color-heading);
    font-weight: bold;
    font-size: 0.9em;
  }
}
</style>
