import './assets/main.css'

import { createApp } from 'vue'
import { useStorage } from '@vueuse/core'

import App from './App.vue'
import router from './router'

import mitt from 'mitt'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import icon kits */
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

/* add icons to the library */
library.add(fas, far)

/* set up the storage */
const storage = useStorage('app-storage', {
  user: null,
  userSession: null,
})

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.config.globalProperties.$storage = storage
app.config.globalProperties.$msgBus = mitt()
app.mount('#app')
