import { createRouter, createWebHistory } from 'vue-router'
import API from '../views/API.vue'
import Devices from '../views/Devices.vue'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import Logout from '../views/Logout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    {
      path: '/devices',
      name: 'devices',
      component: Devices,
    },

    {
      path: '/api',
      name: 'api',
      component: API,
    },

    {
      path: '/login',
      name: 'login',
      component: Login,
    },

    {
      path: '/logout',
      name: 'logout',
      component: Logout,
    },
  ],
})

export default router
