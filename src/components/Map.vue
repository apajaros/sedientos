<template>
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
      <user-position :position="userPosition"></user-position>
    <router-view></router-view>
    </gmap-map>
</template>

<script>
  import * as VueGoogleMaps from 'vue2-google-maps'
  import Vue from 'vue'
  import places from '../assets/places.js'
  import PlaceMarker from '@/components/PlaceMarker.vue'
  import UserPosition from '@/components/UserPosition.vue'
  import VueGeolocation from '@/components/Geolocation'

  Vue.use(VueGoogleMaps, {
    load: {
      key: 'AIzaSyAowE4dyOwEtX8K6ugzA1sXmOLO5pzARgI'
    }
  })
  Vue.use(VueGeolocation)

  export default {
    data () {
      return {
        mapcenter: {lat: 40.4517299, lng: -3.6822692},
        markers: [],
        userPosition: {}
      }
    },
    components: {
      'place-marker': PlaceMarker,
      'user-position': UserPosition
    },
    created () {
      for (const place of places) {
        this.$store.commit('ADD_PLACE', place)
      }
      this.$getLocation().then(position => {
        let userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        this.userPosition = position
        this.recenter(userLocation)
      }).catch(
      (reason) => {
        console.log('geolocation rejected (' + reason + ') here.')
      })
      this.$watchLocation((position) => {
        console.log(position)
      },
      (reason) => {
        console.log('error getting location: ' + reason)
      })
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
    width: 100%;
    height: 100%;
  }

  .vue-map-container {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }
</style>