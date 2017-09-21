<template>
 <v-bottom-sheet v-model="showBottomDrawer" >
  <v-layout row>
    <v-flex xs12 sm4>
      <v-card tile  class="place-card" @click.stop="onClick" v-touch="{up: () => slideUp(), down: () => slideDown()}">
          <v-layout column v-show="showFull">
            <v-card-title class="amber">
              <v-btn dark icon @click="goBackToMap">
                <v-icon>chevron_left</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn dark icon class="mr-3">
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn dark icon>
                <v-icon>more_vert</v-icon>
              </v-btn>
            </v-card-title>
            <v-spacer></v-spacer>
          </v-layout>
        <v-card-title>
          <h3 class="headline mb-0">
            {{ placeInfo.name }} | 
            <span>Caña: {{ placeInfo.beers[0].price | formatPrice }}</span>
            <star-display :stars="stars"></star-display> <template v-if="placeInfo.reviews && placeInfo.reviews.length">({{placeInfo.reviews.length}})</template>
          </h3>
        </v-card-title>
        <v-card-text v-show="showFull">
          {{   placeInfo.address }}
          <v-list>
          <v-subheader v-if="placeInfo.reviews && placeInfo.reviews.length">Opiniones</v-subheader>
            <template v-for="(review, index) in placeInfo.reviews">
              <v-divider></v-divider>
              <v-list-tile avatar @click="" :key="index">
                <v-list-tile-avatar>
                  <v-icon class="indigo--text">account_circle</v-icon>
                  <!-- <img v-bind:src="item.avatar"></v-list-tile-avatar> -->
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ review.user.name }} <star-display :stars="review.stars"></star-display></v-list-tile-title>
                  <v-list-tile-sub-title v-html="review.body"></v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</v-bottom-sheet>
</template>

<script>
  var StarDisplay = {
    template: '<span class="stars amber--text text--lighten-1" v-if="stars > 0"><i class="material-icons star" v-for="n in stars">star</i><i class="material-icons star" v-for="n in (5 - stars)">star_border</i></span>',
    props: {
      stars: {
        type: Number
      }
    }
  }

  export default {
    data () {
      return {
        showBottomDrawer: true,
        showFull: false,
        placeInfo: undefined
      }
    },
    components: {
      'star-display': StarDisplay
    },
    created () {
      this.placeInfo = this.$store.state.places[this.$route.params.id]
    },
    watch: {
      '$route' (to, from) {
        console.log('route change')
      },
      showBottomDrawer () {
        this.goBackToMap()
      }
    },
    computed: {
      stars () {
        if (typeof this.placeInfo.stars === 'undefined') return 0
        return Math.floor(this.placeInfo.stars)
      }
    },
    methods: {
      slideUp () {
        this.showFull = true
      },
      onClick () {
        this.showFull = true
      },
      slideDown () {
        this.showFull = false
      },
      goBackToMap () {
        this.$router.push('/')
      }
    },
    filters: {
      formatPrice (value) {
        return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
      }
    }
  }
</script>

<style>
  #sedientos .overlay--active:before {
    opacity: 0;
  }

  .stars {
    display: inline-block;
  }

  .place-card {
    cursor: pointer;
    overflow-y: auto;
    transition-property: height;
    transition-duration: 1s;
    transition-timing-function: ease-out;
  }

</style>