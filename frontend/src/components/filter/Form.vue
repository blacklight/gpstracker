<template>
  <form class="filter-view" @submit.prevent.stop="handleSubmit">
    <h2>Filter</h2>

    <div class="date-selectors">
      <div class="date-selector">
        <label for="start-date">Start Date</label>
        <input type="datetime-local"
               id="start-date"
               name="start-date"
               @input="newFilter.startDate = startPlusHours($event.target.value, 0)"
               @change="newFilter.startDate = startPlusHours($event.target.value, 0)"
               :value="toLocalString(newFilter.startDate)"
               :max="maxDate" />

        <div class="footer">
          <button type="button"
                  @click="newFilter.startDate = startPlusDays(newFilter.startDate, -7)"
                  :disabled="!newFilter.startDate">-1w</button>
          <button type="button"
                  @click="newFilter.startDate = startPlusDays(newFilter.startDate, -1)"
                  :disabled="!newFilter.startDate">-1d</button>
          <button type="button"
                  @click="newFilter.startDate = startPlusHours(newFilter.startDate, -1)"
                  :disabled="!newFilter.startDate">-1h</button>
          <button type="button"
                  @click="newFilter.startDate = startPlusDays(new Date(), 0)"
                  :disabled="!newFilter.startDate">Now</button>
          <button type="button"
                  @click="newFilter.startDate = startPlusHours(newFilter.startDate, 1)"
                  :disabled="!newFilter.startDate">+1h</button>
          <button type="button"
                  @click="newFilter.startDate = startPlusDays(newFilter.startDate, 1)"
                  :disabled="!newFilter.startDate">+1d</button>
          <button type="button"
                  @click="newFilter.startDate = startPlusDays(newFilter.startDate, 7)"
                  :disabled="!newFilter.startDate">+1w</button>
        </div>
      </div>

      <div class="date-selector">
        <label for="end-date">End Date</label>
        <input type="datetime-local"
               id="end-date"
               name="end-date"
               @input="newFilter.endDate = endPlusHours($event.target.value, 0)"
               @change="newFilter.endDate = endPlusHours($event.target.value, 0)"
               :value="toLocalString(newFilter.endDate)"
               :max="maxDate" />

        <div class="footer">
          <button type="button"
                  @click="newFilter.endDate = endPlusDays(newFilter.endDate, -7)"
                  :disabled="!newFilter.endDate">-1w</button>
          <button type="button"
                  @click="newFilter.endDate = endPlusDays(newFilter.endDate, -1)"
                  :disabled="!newFilter.endDate">-1d</button>
          <button type="button"
                  @click="newFilter.endDate = endPlusHours(newFilter.endDate, -1)"
                  :disabled="!newFilter.endDate">-1h</button>
          <button type="button"
                  @click="newFilter.endDate = endPlusDays(new Date(), 0)"
                  :disabled="!newFilter.endDate">Now</button>
          <button type="button"
                  @click="newFilter.endDate = endPlusHours(newFilter.endDate, 1)"
                  :disabled="!newFilter.endDate">+1h</button>
          <button type="button"
                  @click="newFilter.endDate = endPlusDays(newFilter.endDate, 1)"
                  :disabled="!newFilter.endDate">+1d</button>
          <button type="button"
                  @click="newFilter.endDate = endPlusDays(newFilter.endDate, 7)"
                  :disabled="!newFilter.endDate">+1w</button>
        </div>
      </div>
    </div>

    <div class="limit-container input-text-container">
      <label for="limit">Limit</label>
      <input type="number"
             id="limit"
             name="limit"
             @input="newFilter.limit = Number($event.target.value)"
             @change="newFilter.limit = Number($event.target.value)"
             :value="newFilter.limit"
             min="1" />
    </div>

    <div class="footer">
      <button type="submit" :disabled="!changed">Apply</button>
    </div>
  </form>
</template>

<script lang="ts">
import _ from 'lodash'

export default {
  emit: ['refresh'],
  props: {
    value: Object,
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
    }
  },

  methods: {
    hasChanged(oldValue: any, newValue: any): boolean {
      return !_.isEqual(
        {
          ...oldValue,
          startDate: this.normalizeDate(this.value.startDate),
          endDate: this.normalizeDate(this.value.endDate),
        },
        {
          ...newValue,
          startDate: this.normalizeDate(this.newFilter.startDate),
          endDate: this.normalizeDate(this.newFilter.endDate),
        }
      )
    },

    normalizeDate(date: Date | number | string | null): Date | null {
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

    startPlusHours(date: Date | number | null, hours: number): Date | null {
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

    startPlusDays(date: Date | number | null, days: number): Date | null {
      return this.startPlusHours(date, days * 24)
    },

    endPlusHours(date: Date | number | null, hours: number): Date | null {
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

    endPlusDays(date: Date | number | null, days: number): Date | null {
      return this.endPlusHours(date, days * 24)
    },

    handleSubmit() {
      this.$emit('refresh', this.newFilter)
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
  },
}
</script>

<style lang="scss" scoped>
@use "@/styles/common.scss";

.filter-view {
  background: var(--color-background);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1em;
  border: 1px solid var(--color-border);
  border-radius: 0.5em;
  margin-bottom: 0.25em;
  box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.66);

  .date-selectors {
    display: flex;
    justify-content: space-between;
    width: 100%;

    @include common.mobile {
      flex-direction: column;
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
          padding: 0.25em 0.5em;
          margin-right: 0.25em;
          border: 1px solid var(--color-border);
          border-radius: 0.25em;
          background: var(--color-background);
          font-size: 0.75em;
          cursor: pointer;

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          &:hover {
            color: var(--color-hover);
          }
        }
      }
    }
  }

  .input-text-container {
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
  }
}
</style>
