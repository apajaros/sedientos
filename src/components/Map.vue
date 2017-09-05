<template>
  <div>
    <gmap-map
      :center="mapcenter"
      :zoom="15"
      :options="{clickableIcons: false,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false}"
      @bounds_changed="boundsChanged($event)"
      ref="map"
    >
      <place-marker
        :key="index"
        v-for="(m, index) in markers"
        :position="m.position"
        :info="m"
        @click="onClick"
      ></place-marker>
    </gmap-map>
    <router-view></router-view>
  </div>
</template>

<script>
  import * as VueGoogleMaps from 'vue2-google-maps'
  import Vue from 'vue'
  import places from '../assets/places.js'
  import PlaceMarker from '@/components/PlaceMarker.vue'

  Vue.use(VueGoogleMaps, {
    load: {
      key: 'AIzaSyAowE4dyOwEtX8K6ugzA1sXmOLO5pzARgI'
    }
  })

  export default {
    data () {
      return {
        mapcenter: {lat: 40.4517299, lng: -3.6822692},
        markers: []
      }
    },
    components: {
      'place-marker': PlaceMarker
    },
    created () {
      for (const place of places) {
        this.$store.commit('ADD_PLACE', place)
      }
    },
    methods: {
      boundsChanged ($bounds) {
        this.getPlaces($bounds)
      },
      recenter (coord) {
        this.mapcenter = coord
      },
      getPlaces (bounds) {
        let visibleMarkers = []
        for (const key in this.$store.state.places) {
          const place = this.$store.state.places[key]
          if (bounds.contains(place.position)) visibleMarkers.push(place)
        }
        this.markers = visibleMarkers
      },
      onClick ($event) {
        this.$router.push({name: 'place', params: {id: $event.info.id}})
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