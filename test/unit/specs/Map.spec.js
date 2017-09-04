import Vue from 'vue'
import MyMap from '@/components/Map'

describe('Map.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(MyMap)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.vue-map')).to.not.be.null
  })
})
