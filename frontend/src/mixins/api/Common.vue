<script lang="ts">
import type { Optional } from '../../models/Types';

// @ts-ignore
const baseURL = __API_PATH__

export default {
  methods: {
    async request(path: string, params?: {
      method?: string,
      query?: Optional<Record<string, any>>,
      body?: Optional<any>,
    }): Promise<any> {
      let { method, query, body } = params || {}
      if (!method?.length) {
        method = 'GET'
      }

      try {
        const response = await fetch(
          `${baseURL}${path}` + (
            query ? '?' + new URLSearchParams(
              Object.entries(query).reduce((acc: any, [key, value]) => {
                if (value != null && key != 'data') {
                  acc[key] = value
                }

                if (value instanceof Date) {
                  acc[key] = value.getTime()
                }

                return acc
              }, {})
            ) : ''
          ), {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
          }
        )

        let result = null
        try {
          result = await response.json()
        } catch (error) {
          result = response
        }

        if (!response.ok) {
          throw new Error(
            `${method} ${path}: ${response.status}: ${result?.error || response.statusText}`
          )
        }

        return result
      } catch (error) {
        const e = (error as any)?.message || error
        // @ts-ignore
        this.$msgBus.emit('message', {
          content: e,
          isError: true,
        })
      }
    },
  },
}
</script>
