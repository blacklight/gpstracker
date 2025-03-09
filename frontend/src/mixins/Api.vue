<script lang="ts">
import Auth from './api/Auth.vue'
import Devices from './api/Devices.vue'
import GPSData from './api/GPSData.vue'
import Sessions from './api/Sessions.vue'
import Users from './api/Users.vue'

export default {
  mixins: [
    Auth,
    Devices,
    GPSData,
    Sessions,
    Users,
  ],
}
</script>
