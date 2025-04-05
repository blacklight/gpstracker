<template>
  <form class="filter-view" @submit.prevent.stop="handleSubmit">
    <header>
      <h2>Filter</h2>
    </header>

    <main>
      <div class="date-range-toggle">
        <input type="checkbox"
               id="date-range-toggle"
               name="date-range-toggle"
               v-model="enableDateRange"
               :disabled="disabled" />&nbsp;
        <label for="date-range-toggle">Set Date Range</label>
      </div>

      <div class="date-selectors" v-if="enableDateRange">
        <div class="date-selector">
          <label for="start-date">
            <font-awesome-icon icon="fas fa-calendar-day" />
            Start Date
          </label>
          <input type="datetime-local"
                 id="start-date"
                 name="start-date"
                 @input="newFilter.startDate = startPlusHours($event, 0)"
                 @change="newFilter.startDate = startPlusHours($event, 0)"
                 :value="toLocalString(newFilter.startDate)"
                 :disabled="disabled"
                 :max="maxDate" />

          <div class="footer">
            <button type="button"
                    @click="newFilter.startDate = startPlusDays(newFilter.startDate, -7)"
                    :disabled="disabled || !newFilter.startDate">-1w</button>
            <button type="button"
                    @click="newFilter.startDate = startPlusDays(newFilter.startDate, -1)"
                    :disabled="disabled || !newFilter.startDate">-1d</button>
            <button type="button"
                    @click="newFilter.startDate = startPlusHours(newFilter.startDate, -1)"
                    :disabled="disabled || !newFilter.startDate">-1h</button>
            <button type="button"
                    @click="newFilter.startDate = startPlusDays(new Date(), 0)"
                    :disabled="disabled || !newFilter.startDate">Now</button>
            <button type="button"
                    @click="newFilter.startDate = startPlusHours(newFilter.startDate, 1)"
                    :disabled="disabled || !newFilter.startDate">+1h</button>
            <button type="button"
                    @click="newFilter.startDate = startPlusDays(newFilter.startDate, 1)"
                    :disabled="disabled || !newFilter.startDate">+1d</button>
            <button type="button"
                    @click="newFilter.startDate = startPlusDays(newFilter.startDate, 7)"
                    :disabled="disabled || !newFilter.startDate">+1w</button>
          </div>
        </div>

        <div class="date-selector">
          <label for="end-date">
            <font-awesome-icon icon="fas fa-calendar-day" />
            End Date
          </label>
          <input type="datetime-local"
                 id="end-date"
                 name="end-date"
                 @input="newFilter.endDate = endPlusHours($event, 0)"
                 @change="newFilter.endDate = endPlusHours($event, 0)"
                 :value="toLocalString(newFilter.endDate)"
                 :disabled="disabled"
                 :max="maxDate" />

          <div class="footer">
            <button type="button"
                    @click="newFilter.endDate = endPlusDays(newFilter.endDate, -7)"
                    :disabled="disabled || !newFilter.endDate">-1w</button>
            <button type="button"
                    @click="newFilter.endDate = endPlusDays(newFilter.endDate, -1)"
                    :disabled="disabled || !newFilter.endDate">-1d</button>
            <button type="button"
                    @click="newFilter.endDate = endPlusHours(newFilter.endDate, -1)"
                    :disabled="disabled || !newFilter.endDate">-1h</button>
            <button type="button"
                    @click="newFilter.endDate = endPlusDays(new Date(), 0)"
                    :disabled="disabled || !newFilter.endDate">Now</button>
            <button type="button"
                    @click="newFilter.endDate = endPlusHours(newFilter.endDate, 1)"
                    :disabled="disabled || !newFilter.endDate">+1h</button>
            <button type="button"
                    @click="newFilter.endDate = endPlusDays(newFilter.endDate, 1)"
                    :disabled="disabled || !newFilter.endDate">+1d</button>
            <button type="button"
                    @click="newFilter.endDate = endPlusDays(newFilter.endDate, 7)"
                    :disabled="disabled || !newFilter.endDate">+1w</button>
          </div>
        </div>
      </div>

      <div class="container limit-container">
        <label for="limit">
          <font-awesome-icon icon="fas fa-list-ol" />
          Max Results
        </label>
        <input type="number"
               id="limit"
               name="limit"
               @input="setLimit"
               @change="setLimit"
               :value="newFilter.limit"
               :disabled="disabled"
               min="1" />
      </div>

      <div class="container order-container">
        <label for="order">
          <font-awesome-icon icon="fas fa-sort" />
          Order
        </label>
        <select id="order"
                name="order"
                v-model="newFilter.order"
                :disabled="disabled">
          <option value="asc">Oldest points first</option>
          <option value="desc">Newest points first</option>
        </select>
      </div>

      <div class="container resolution-container">
        <label for="resolution">
          <p class="title">
            <font-awesome-icon icon="fas fa-ruler" />
            Resolution (m)
          </p>

          <p class="help">
            Adjacent points below this distance will be merged
          </p>
        </label>

        <input type="number"
               id="resolution"
               name="resolution"
               :value="resolution"
               :disabled="disabled"
               @input="setResolution"
               @change="setResolution"
               min="0" />
      </div>

      <div class="container device-container">
        <label for="device">
          <font-awesome-icon icon="fas fa-mobile-alt" />
          Device
        </label>
        <select id="device"
                name="device"
                v-model="newFilter.deviceId"
                :disabled="disabled">
          <option value="">All</option>
          <option v-for="device in devices" :key="device.id" :value="device.id">{{ device.name }}</option>
        </select>
      </div>

      <div class="container country-container">
        <label for="country">
          <p class="title">
            <font-awesome-icon icon="fas fa-globe" />
            Country
          </p>
        </label>

        <Autocomplete
          id="country"
          name="country"
          placeholder="Filter by country"
          allow-only-values
          :value="newFilter.country || ''"
          :values="autocompleteCountries"
          :disabled="disabled"
          @input="newFilter.country = $event" />
      </div>

      <div class="container locality-container">
        <label for="locality">
          <p class="title">
            <font-awesome-icon icon="fas fa-map-marker-alt" />
            Locality
          </p>
        </label>

        <input type="text"
               id="locality"
               name="locality"
               placeholder="Filter by locality"
               v-model="newFilter.locality"
               :disabled="disabled" />
      </div>

      <div class="container address-container">
        <label for="address">
          <p class="title">
            <font-awesome-icon icon="fas fa-home" />
            Address
          </p>
        </label>

        <input type="text"
               id="address"
               name="address"
               placeholder="Filter by address"
               v-model="newFilter.address"
               :disabled="disabled" />
      </div>

      <div class="container postal-code-container col-s-12">
        <label for="postal-code">
          <p class="title">
            <font-awesome-icon icon="fas fa-mail-bulk" />
            Postal Code
          </p>
        </label>

        <input type="text"
               id="postal-code"
               name="postal-code"
               placeholder="Filter by postal code"
               v-model="newFilter.postalCode"
               :disabled="disabled" />
      </div>

      <div class="container description-container">
        <label for="description">
          <p class="title">
          <font-awesome-icon icon="fas fa-comment" />
            Description
          </p>
        </label>

        <input type="text"
               id="description"
               name="description"
               placeholder="Filter by description"
               v-model="newFilter.description"
               :disabled="disabled" />
      </div>
    </main>

    <footer>
      <button type="submit" :disabled="disabled || !changed">
        <font-awesome-icon icon="fas fa-check" />&nbsp;Apply
      </button>
    </footer>
  </form>
</template>

<script lang="ts">
import _ from 'lodash'

import Autocomplete from '../../elements/Autocomplete.vue'
import AutocompleteValue from '../../models/AutocompleteValue'
import Country from '../../models/Country'
import LocationQuery from '../../models/LocationQuery'
import LocationQueryMixin from '../../mixins/LocationQuery.vue'
import UserDevice from '../../models/UserDevice'

export default {
  mixins: [LocationQueryMixin],
  emit: [
    'refresh',
    'set-resolution',
  ],

  components: {
    Autocomplete,
  },

  props: {
    value: LocationQuery,
    countries: {
      type: Array as () => Country[],
      default: () => [],
    },
    devices: {
      type: Array as () => UserDevice[],
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    resolution: {
      type: Number,
      required: true,
    },
  },

  computed: {
    autocompleteCountries(): AutocompleteValue[] {
      return this.countries.map((country: Country) => ({
        value: country.code,
        label: `${country.flag} ${country.name}`,
        data: country,
      }))
    },
    maxDate() {
      return this.toLocalString(this.endPlusHours(new Date(), 0))
    }
  },

  data() {
    return {
      changed: false,
      enableDateRange: false,
      newFilter: {...this.value},
      newResolution: this.resolution,
    }
  },

  methods: {
    startPlusHours(date: Date | number | Event | undefined | null, hours: number): Date | null {
      if ((date as any)?.target?.value) {
        date = (date as any).target.value
      }

      let d = this.normalizeDate(date)
      if (!d) {
        return null
      }

      d = new Date(d.getTime() + hours * 60 * 60 * 1000)
      const end = this.normalizeDate(this.newFilter.endDate)
      // Don't accept future dates, or dates that are greater than the current end date
      if (d.getTime() > new Date().getTime() || end && d.getTime() > end.getTime()) {
        return end ? new Date(end.getTime() - 60000) : new Date()
      }

      return d
    },

    startPlusDays(date: Date | number | Event | undefined | null, days: number): Date | null {
      return this.startPlusHours(date, days * 24)
    },

    endPlusHours(date: Date | number | Event | undefined | null, hours: number): Date | null {
      if ((date as any)?.target?.value) {
        date = (date as any).target.value
      }

      let d = this.normalizeDate(date)
      if (!d) {
        return null
      }

      d = new Date(d.getTime() + hours * 60 * 60 * 1000)
      // Don't accept future dates
      if (d.getTime() > new Date().getTime()) {
        return new Date()
      }

      // Or dates that are less than the current start date
      const start = this.normalizeDate(this.newFilter.startDate)
      if (start && d.getTime() < start.getTime()) {
        return start ? new Date(start.getTime() + 60000) : new Date()
      }

      return d
    },

    endPlusDays(date: Date | number | Event | undefined | null, days: number): Date | null {
      return this.endPlusHours(date, days * 24)
    },

    handleSubmit() {
      this.$emit('refresh', new LocationQuery(this.newFilter))
      if (this.newResolution !== this.resolution) {
        this.$emit('set-resolution', this.newResolution)
      }
    },

    setLimit(event: Event) {
      this.newFilter.limit = Number((event.target as HTMLInputElement).value)
    },

    setResolution(event: Event) {
      this.newResolution = Number((event.target as HTMLInputElement).value)
    },

    initDateRange(value: LocationQuery) {
      this.enableDateRange = !!(value?.startDate && value?.endDate)
    },
  },

  mounted() {
    if (this.value) {
      this.initDateRange(this.value)
    }
  },

  watch: {
    value: {
      handler(value: LocationQuery) {
        this.newFilter = {...value}
        this.changed = false
      },
      immediate: true,
      deep: true,
    },

    newFilter: {
      handler(value: LocationQuery) {
        this.changed = this.isQueryChanged({
          newValue: value,
          oldValue: this.value
        })
        this.initDateRange(value)
      },
      immediate: true,
      deep: true,
    },

    newResolution(value: number) {
      this.changed = this.changed || value !== this.resolution
    },

    enableDateRange(value: boolean) {
      if (!value) {
        this.newFilter.startDate = null
        this.newFilter.endDate = null
      } else {
        if (!this.newFilter.startDate) {
          this.newFilter.startDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        }

        if (!this.newFilter.endDate) {
          this.newFilter.endDate = new Date()
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@use "@/styles/common.scss" as *;

$header-height: 2.5em;
$footer-height: 3.5em;

.filter-view {
  height: 100%;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1em 0;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 0.5em;
  margin-bottom: 0.25em;
  box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.66);

  @include until(desktop) {
    width: calc(100vw - 2em);
  }

  @include from(desktop) {
    width: 50em;
  }

  header {
    width: 100%;
    height: $header-height;
    display: flex;
    justify-content: center;
  }

  footer {
    width: 100%;
    height: $footer-height;
    display: flex;
    justify-content: center;

    button {
      height: 2.5em;
    }
  }

  main {
    height: calc(100% - $header-height - $footer-height - 5em);
    max-height: 25em;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    padding: 1em;

    @include until(tablet) {
      flex-direction: column;
      flex-wrap: nowrap;
    }

    @include from(tablet) {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5em 1em;
      flex-direction: column;

      @include until(tablet) {
        width: 100%;
      }

      @include from(tablet) {
        width: 50%;
      }

      label {
        margin-bottom: 0.25em;
        @include until(tablet) {
          margin-top: 0.75em;
        }
      }

      input {
        width: 100%;
        @include until(tablet) {
          margin-bottom: 0.5em;
        }
      }
    }
  }

  .date-selectors {
    display: flex;
    justify-content: space-between;
    width: 100%;

    @include media(mobile) {
      flex-direction: column;
    }

    @include media(tablet) {
      flex-direction: row;
    }

    .date-selector {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0.5em;

      label {
        margin-bottom: 0.25em;
      }

      input {
        width: 100%;
      }

      .footer {
        display: flex;
        justify-content: center;
        margin-top: 0.5em;

        button {
          margin-right: 0.25em;
          font-size: 0.75em;
        }
      }
    }
  }

  .date-range-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    input {
      margin-right: 0.25em;
    }
  }

  .limit-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .resolution-container {
    label {
      margin-bottom: 0.25em;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    input {
      width: 100%;
    }

    .help {
      font-size: 0.75em;
    }
  }

  button[type=submit] {
    min-width: 10em;
  }

  .help {
    font-size: 0.75em;
  }
}
</style>
