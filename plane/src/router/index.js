import Vue from 'vue'
import Router from 'vue-router'
import fcbee from '@/components/FCbee'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'fcbee',
      component: fcbee
    }
  ]
})
