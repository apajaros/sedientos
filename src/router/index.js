import Vue from 'vue'
import Router from 'vue-router'
import Map from '@/components/Map'
import PlaceCard from '@/components/PlaceCard'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Map',
      component: Map,
      children: [
        {
          path: 'place/:id',
          name: 'place',
          component: PlaceCard
        }
      ]
    }
  ]
})
