<template>
    <gmap-map
      :center="mapCenter"
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
        :position="m.location"
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
  import UserPosition from '@/components/UserPosition'
  import VueGeolocation from '@/components/Geolocation'
  import PlaceMarker from '@/components/PlaceMarker'

  Vue.use(VueGoogleMaps, {
    load: {
      key: 'AIzaSyAowE4dyOwEtX8K6ugzA1sXmOLO5pzARgI'
    }
  })
  Vue.use(VueGeolocation)

  var config = require('../../config')
  let apiUrl
  if (process.env.NODE_ENV === 'development') {
    apiUrl = JSON.parse(config.dev.env.API_URL)
  } else {
    apiUrl = JSON.parse(config.build.env.API_URL)
  }

  export default {
    data () {
      return {
        markers: [],
        userPosition: {}
      }
    },
    computed: {
      mapCenter () {
        return this.$store.state.center
      }
    },
    components: {
      'place-marker': PlaceMarker,
      'user-position': UserPosition
    },
    mounted () {
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
        this.recenter(this.mapCenter)
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
        this.paintSavedPlaces($bounds)
      },
      recenter (coord) {
        this.fetchPlaces(coord.lat, coord.lng)
        this.$store.commit('UPDATE_CENTER', coord)
      },
      paintSavedPlaces (bounds) {
        let visibleMarkers = []
        for (const key in this.$store.state.places) {
          const place = this.$store.state.places[key]
          if (bounds.contains(place.location)) visibleMarkers.push(place)
        }
        this.markers = visibleMarkers
      },
      onClick ($event) {
        this.$router.push({name: 'place', params: {id: $event.info.id}})
      },
      fetchPlaces (lat, lng) {
        this.$http.get(apiUrl + 'places/search/findByLocationNear?point=' + lat + ',' + lng + '&max_distance=1km').then((response) => {
          for (const place of response.body._embedded.places) {
            // Add id for internal routing
            const linkParts = place._links.self.href.split('/')
            place.id = linkParts[linkParts.length - 1]
            this.$store.commit('ADD_PLACE', place)
          }
          if (this.$refs.map && this.$refs.map.$mapObject) {
            this.paintSavedPlaces(this.$refs.map.$mapObject.getBounds())
          }
        })
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