<template>
  <div>
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
      <div slot="visible">
        <v-snackbar
            :success="context === 'success'"
            :info="context === 'info'"
            :error="context === 'error'"
            :absolute="true"
            :top="true"
            v-model="snackbar"
        >
          {{ snackbarMessage }}
          <v-progress-circular indeterminate class="amber--text" v-show="loading"></v-progress-circular>
          <v-btn dark flat @click.native="snackbar = false">Close</v-btn>
        </v-snackbar>
      </div>
      <user-position :position="userPosition"></user-position>
    </gmap-map>
  </div>
</template>

<script>
  import * as VueGoogleMaps from 'vue2-google-maps'
  import Vue from 'vue'
  import UserPosition from '@/components/UserPosition'
  import VueGeolocation from '@/components/Geolocation'
  import PlaceMarker from '@/components/PlaceMarker'
  import { EventBus } from '@/components/EventBus'

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
        mapCenter: {lat: 40.4517299, lng: -3.6822692},
        markers: [],
        userPosition: {},
        snackbar: false,
        context: 'info',
        loading: false,
        snackbarMessage: ''
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
        this.fetchPlaces(userLocation)
      }).catch(
      (reason) => {
        console.log('geolocation rejected (' + reason + ') here.')
        this.mapCenter = this.$store.state.center
        this.fetchPlaces(this.mapCenter)
      })
      this.$watchLocation((position) => {
        console.log(position)
        this.userPosition = position
      },
      (reason) => {
        console.log('error getting location: ' + reason)
      })

      EventBus.$on('recenter', () => {
        if (this.userPosition.coords) {
          let userLocation = {
            lat: this.userPosition.coords.latitude,
            lng: this.userPosition.coords.longitude
          }
          this.recenter(userLocation)
        }
      })
      EventBus.$on('search', () => {
        this.fetchPlacesInView()
      })
    },
    methods: {
      boundsChanged ($bounds) {
        this.paintSavedPlaces($bounds)
        const center = this.$refs.map.$mapObject.center
        this.$store.commit('UPDATE_CENTER', {lat: center.lat(), lng: center.lng()})
      },
      recenter (coord) {
        this.mapCenter = coord
        this.$refs.map.panTo(coord)
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
      fetchPlaces (coord) {
        this.fetchFromApi(apiUrl + 'places/search/findByLocationNear?point=' + coord.lat + ',' + coord.lng + '&max_distance=1km')
      },
      fetchPlacesInView () {
        if (this.$refs.map) {
          if (this.$refs.map.$mapObject.zoom < 14) {
            this.context = 'info'
            this.loading = false
            this.snackbarMessage = 'Please, search in a smaller area'
            this.snackbar = true
            return
          }
          const bounds = this.$refs.map.$mapObject.getBounds()
          this.fetchFromApi(apiUrl + 'places/search/findByLocationWithin?box=' + bounds.b.b + ',' + bounds.f.b + ',' + bounds.b.f + ',' + bounds.f.f)
        }
      },
      fetchFromApi (uri) {
        this.context = 'info'
        this.loading = true
        this.snackbarMessage = 'loading'
        this.snackbar = true

        this.$http.get(uri)
        .then((response) => {
          this.handleApiPlacesResponse(response)
          this.context = 'success'
          this.snackbar = false
        }).catch((error) => {
          console.log(error)
          this.context = 'error'
          this.loading = false
          this.snackbarMessage = 'Error while loading data!'
        })
      },
      handleApiPlacesResponse (response) {
        for (const place of response.body._embedded.places) {
          // Add id for internal routing
          const linkParts = place._links.self.href.split('/')
          place.id = linkParts[linkParts.length - 1]
          if (place.location.x) {
            const location = {lat: place.location.y, lng: place.location.x}
            place.location = location
          }
          this.$store.commit('ADD_PLACE', place)
        }
        if (this.$refs.map && this.$refs.map.$mapObject) {
          this.paintSavedPlaces(this.$refs.map.$mapObject.getBounds())
        }
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