<script lang="ts">
import Auth from './api/Auth.vue'
import GPSData from './api/GPSData.vue'
import Users from './api/Users.vue'

export default {
  mixins: [
    Auth,
    GPSData,
    Users,
  ],
}
</script>
