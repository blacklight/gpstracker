<template>
  <form class="filter-view" @submit.prevent.stop="handleSubmit">
    <h2>Filter</h2>

    <div class="date-selectors">
      <div class="date-selector">
        <label for="start-date">Start Date</label>
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
        <label for="end-date">End Date</label>
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

    <div class="pagination-container">
      <div class="page-button-container">
        <button type="button"
                :disabled="disabled"
                v-if="value?.minId || value?.maxId"
                @click.stop="$emit('reset-page')">
          <font-awesome-icon icon="fas fa-undo" />
        </button>
      </div>

      <div class="page-button-container">
        <button type="button"
                @click="$emit('prev-page')"
                title="Previous Results"
                :disabled="disabled || !hasPrevPage">
          <font-awesome-icon icon="fas fa-chevron-left" />
        </button>
      </div>

      <div class="limit-container">
        <label for="limit">Max Results</label>
        <input type="number"
               id="limit"
               name="limit"
               @input="setLimit"
               @change="setLimit"
               :value="newFilter.limit"
               :disabled="disabled"
               min="1" />
      </div>

      <div class="page-button-container">
        <button type="button"
                @click="$emit('next-page')"
                title="Next Results"
                :disabled="disabled || !hasNextPage">
          <font-awesome-icon icon="fas fa-chevron-right" />
        </button>
      </div>
    </div>

    <div class="resolution-container">
      <label for="resolution">
        <p class="title">
          Resolution (m)
        </p>

        <p class="help">
          Adjacent points will be at least this far apart.
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

    <div class="footer">
      <button type="submit" :disabled="disabled || !changed">
        <font-awesome-icon icon="fas fa-check" />&nbsp;Apply
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import _ from 'lodash'

export default {
  emit: [
    'next-page',
    'prev-page',
    'reset-page',
    'refresh',
    'set-resolution',
  ],
  props: {
    value: Object,
    disabled: {
      type: Boolean,
      default: false,
    },
    hasPrevPage: {
      type: Boolean,
      default: true,
    },
    hasNextPage: {
      type: Boolean,
      default: true,
    },
    resolution: {
      type: Number,
      required: true,
    },
  },

  computed: {
    maxDate() {
      return this.toLocalString(this.endPlusHours(new Date(), 0))
    }
  },

  data() {
    return {
      changed: false,
      newFilter: {...this.value},
      newResolution: this.resolution,
    }
  },

  methods: {
    hasChanged(oldValue: any, newValue: any): boolean {
      return !_.isEqual(
        {
          ...oldValue,
          startDate: this.normalizeDate(this.value?.startDate),
          endDate: this.normalizeDate(this.value?.endDate),
        },
        {
          ...newValue,
          startDate: this.normalizeDate(this.newFilter.startDate),
          endDate: this.normalizeDate(this.newFilter.endDate),
        }
      )
    },

    normalizeDate(date: any): Date | null {
      if (!date) {
        return null
      }

      if (typeof date === 'number' || typeof date === 'string') {
        date = new Date(date)
      }

      // Round to the nearest minute
      return new Date(Math.floor(date.getTime() / 60000) * 60000)
    },

    toLocalString(date: Date | string | number | null): string {
      const d = this.normalizeDate(date)
      if (!d) {
        return ''
      }

      return new Date(
        d.getTime() - (d.getTimezoneOffset() * 60000)
      ).toISOString().slice(0, -8)
    },

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
      this.$emit('refresh', this.newFilter)
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
  },

  watch: {
    value: {
      handler(value) {
        this.newFilter = {...value}
        this.changed = false
      },
      immediate: true,
      deep: true,
    },

    newFilter: {
      handler(value) {
        this.changed = this.hasChanged(this.value, value)
      },
      immediate: true,
      deep: true,
    },

    newResolution(value) {
      this.changed = this.changed || value !== this.resolution
    },
  },
}
</script>

<style lang="scss" scoped>
@use "@/styles/common.scss" as *;

.filter-view {
  height: 100%;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1em;
  border: 1px solid var(--color-border);
  border-radius: 0.5em;
  margin-bottom: 0.25em;
  box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.66);

  @include media(mobile) {
    width: calc(100vw - 2em);
  }

  @include media(tablet) {
    width: 100%;
    min-width: 45em;
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

  .pagination-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 0.5em;

    .limit-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .page-button-container {
      display: flex;
      justify-content: center;
    }

    label {
      margin-bottom: 0.25em;
    }

    input {
      width: 100%;
    }
  }

  .resolution-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0.5em;

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
