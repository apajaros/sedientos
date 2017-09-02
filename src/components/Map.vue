<template>
    <gmap-map
      :center="mapcenter"
      :zoom="15"
      ref="map"
    >
      <gmap-marker
        :key="index"
        v-for="(m, index) in markers"
        :position="m.position"
        :clickable="true"
        :draggable="false"
        @click="recenter(m.position)"
      ></gmap-marker>
    </gmap-map>
</template>

<script>
  import * as VueGoogleMaps from 'vue2-google-maps'
  import Vue from 'vue'

  Vue.use(VueGoogleMaps, {
    load: {
      key: 'AIzaSyAowE4dyOwEtX8K6ugzA1sXmOLO5pzARgI'
    }
  })

  export default {
    data () {
      return {
        mapcenter: {lat: 40.4517299, lng: -3.6822692},
        markers: [
          {
            position: {lat: 40.4510299, lng: -3.6853692}
          }, {
            position: {lat: 40.4420299, lng: -3.6973292}
          }
        ]
      }
    },
    methods: {
      recenter: function (coord) {
        this.mapcenter = coord
      }
    },
    watch: {
      '$route' (to, from) {
        // Call resizePreserveCenter() on all maps
        Vue.$gmapDefaultResizeBus.$emit('resize')
      }
    }
  }
</script>

<style scoped>
  gmap-map {
    width:100%;
    height: calc(100vh - 64px);
    display: block;
  }
  .vue-map-container {
    height: calc(100vh - 64px);
  }
</style>