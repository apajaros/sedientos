import Vue from 'vue'
import Router from 'vue-router'
import PlaceCard from '@/components/PlaceCard'
import LoginCallback from '@/components/LoginCallback'
// import Review from '@/components/Review'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/place/:id',
      name: 'place',
      component: PlaceCard
      // ,children: [
      //   {
      //     path: 'review',
      //     name: 'review',
      //     component: Review
      //   }
      // ]
    },
    {
      path: '/callback',
      component: LoginCallback
    }
  ]
})
