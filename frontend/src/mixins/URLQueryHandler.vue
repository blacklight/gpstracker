<script lang="ts">
import _ from 'lodash'

import LocationQueryMixin from './LocationQuery.vue'

function isDate(key: string, value: string): boolean {
  return (
    (
      key.toLowerCase().endsWith('date') ||
      key.toLowerCase().endsWith('time') ||
      key.toLowerCase().endsWith('timestamp')
    ) && new Date(value).toString() !== 'Invalid Date'
  )
}

function parseValue(key: string, value: string | null): string | number | boolean | Date | undefined {
  value = decodeURI(value?.trim() || '')
  if (!value.length) {
    return undefined
  } else if (value.toLowerCase() === 'true') {
    return true
  } else if (value.toLowerCase() === 'false') {
    return false
  } else if (isDate(key, value)) {
    return new Date(value)
  } else if (!isNaN(Number(value))) {
    return Number(value)
  } else {
    return value
  }
}

function encodeValue(value: string | number | boolean | Date): string {
  if (value instanceof Date) {
    return value.getTime().toString()
  } else {
    return encodeURI(value.toString())
  }
}

export default {
  mixins: [LocationQueryMixin],
  data() {
    return {
      query: this.parseQuery(window.location.href),
    }
  },

  methods: {
    parseQuery(query: string): Record<string, string> {
      return query
        .replace(/^[^#]*#?(.*)/, (_, hash) => hash)
        .split('&')
        .reduce((acc: Record<string, any>, pair: string) => {
          const [key, value] = pair.split('=', 2).map((part: string) => part.trim())
          if (key.length) {
            const v = parseValue(key, value)
            if (v != null) {
              acc[key] = v
            }
          }
          return acc
        }, {})
    },

    toQueryString(values: Record<string, any>) {
      return Object.entries(values)
        .filter(([_, value]) => value != null && value.toString() !== '[object Object]')
        .map(([key, value]) => `${key}=${encodeValue(value)}`)
        .join('&')
    },

    setQuery(values: Record<string, any>) {
      const newQuery = this.toQueryString(values)
      window.location.hash = newQuery
    },
  },

  watch: {
    $route(newRoute: { fullPath: string }, oldRoute: { fullPath: string }) {
      const oldQuery = this.parseQuery(oldRoute.fullPath)
      const newQuery = this.parseQuery(newRoute.fullPath)
      if (this.isQueryChanged({oldValue: oldQuery, newValue: newQuery})) {
        this.query = newQuery
      }
    },
  },
}
</script>
