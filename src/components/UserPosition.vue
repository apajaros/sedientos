<template v-if="typeof position.coords !== 'undefined'">
  <div>
  <gmap-marker
  :position="userPosition"
  :clickable="false"
  :draggable="false"
  :icon="icon"
  ></gmap-marker>
  <gmap-circle :center="userPosition" :options="options" :radius="getRadius"></gmap-circle>
  </div>
</template>

<script>
  import * as VueGoogleMaps from 'vue2-google-maps'

  export default {
    data () {
      return {
        options: {
          fillColor: 'blue',
          fillOpacity: 0.2,
          strokeWeight: 0,
          clickable: false
        },
        icon: undefined
      }
    },
    props: ['position'],
    computed: {
      userPosition () {
        if (this.position && this.position.coords) {
          return {lat: this.position.coords.latitude, lng: this.position.coords.longitude}
        }
        return {}
      },
      getRadius () {
        if (this.position && this.position.coords) {
          return this.position.coords.accuracy
        }
      }
    },
    created () {
      VueGoogleMaps.loaded.then(() => {
        // We need to wait for the map (and google API) to add the custom marker
        this.icon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#4285F4',
          fillOpacity: 0.9,
          strokeColor: 'white',
          scale: 7,
          strokeWeight: 2
        }
      })
    }
  }
</script>