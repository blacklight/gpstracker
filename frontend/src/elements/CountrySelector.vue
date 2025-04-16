<template>
  <div class="country-selector">
    <Loading v-if="loading" />
    <Autocomplete
      :id="id"
      :name="name"
      :placeholder="placeholder"
      :value="value"
      :values="autocompleteCountries"
      :disabled="disabled || loading"
      allow-only-values
      @input="onInput" />
  </div>
</template>

<script lang="ts">
import { countries } from 'countries-list'

import Autocomplete from './Autocomplete.vue'
import AutocompleteValue from '../models/AutocompleteValue'
import Country from '../models/Country'
import Loading from './Loading.vue'
import Stats from '../mixins/Stats.vue'

export default {
  mixins: [Stats],
  components: {
    Autocomplete,
    Loading,
  },

  props: {
    countries: {
      type: Array as () => Country[],
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    id: {
      type: String,
      default: 'country',
    },

    name: {
      type: String,
      default: 'country',
    },

    placeholder: {
      type: String,
      default: 'Select a country',
    },

    showAll: {
      type: Boolean,
      default: false,
    },

    value: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      countries_: this.countries ? [...this.countries] : [],
      loading: false,
    }
  },

  computed: {
    autocompleteCountries(): AutocompleteValue[] {
      const visitedCountries = this.countries_.reduce(
        (acc: Record<string, AutocompleteValue>, country: Country) => {
          acc[country.code] = this.toAutocompleteValue(country)
          return acc
        }, {}
      );

      if (!this.showAll) {
        return Object.values(visitedCountries)
      }

      const unvisitedCountries = Object.keys(countries).reduce(
        (acc: Record<string, AutocompleteValue>, key: string) => {
          if (visitedCountries[key]) {
            return acc
          }

          // @ts-ignore
          acc[key] = this.toAutocompleteValue(countries[key] as any)
          return acc
        }, {}
      )

      return [
        ...Object.values(visitedCountries) as AutocompleteValue[],
        ...Object.values(unvisitedCountries) as AutocompleteValue[],
      ]
    },
  },

  methods: {
    onInput(value: string) {
      this.$emit('input', value)
    },

    toAutocompleteValue(country: {
      code: string
      name: string
      flag: string
    }): AutocompleteValue {
      return new AutocompleteValue({
        value: country.code,
        label: `${country.flag} ${country.name}`,
        data: country,
      })
    },
  },

  created: function () {
    if (!this.countries) {
      this.getCountries().then((countries: Country[]) => {
        this.countries_ = countries
      })
    }
  },
}
</script>

<style scoped lang="scss">
.country-selector {
  position: relative;
  width: 100%;
  margin: 0 auto;
}
</style>
