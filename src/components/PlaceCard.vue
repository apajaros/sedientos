<template>
 <div v-show="showBottomDrawer" id="place-card-container" v-bind:class="{fullheight:showFull}">
  <v-layout row v-model="showBottomDrawer" class="myClass">
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
            {{ placeInfo.name }}
            <span v-if="placeInfo.beers"> | Caña: {{ placeInfo.beers[0].price | formatPrice }}</span>
            <star-display :stars="stars"></star-display> <template v-if="placeInfo.reviews && placeInfo.reviews.length">({{placeInfo.reviews.length}})</template>
          </h3>
        </v-card-title>
        <v-card-text v-show="showFull">
          <p v-if="placeInfo.address">{{   placeInfo.address }}</p>
          <p v-if="placeInfo.phoneNumber">{{   placeInfo.phoneNumber }}</p>
          <p v-if="placeInfo.website">{{   placeInfo.website }}</p>
          <p v-if="placeInfo.email">{{   placeInfo.email }}</p>
          <p v-if="placeInfo.openingHours">{{   placeInfo.openingHours }}</p>
          <v-subheader v-if="placeInfo.reviews && placeInfo.reviews.length">Opiniones</v-subheader>
          <v-expansion-panel expand>
            <v-expansion-panel-content v-for="(review, index) in placeInfo.reviews" :key="index" >
              <div slot="header"><v-icon class="indigo--text">account_circle</v-icon> {{ review.user.name }} <star-display :stars="review.stars"></star-display></div>
              <v-card>
                <v-card-text v-html="review.body"></v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-dialog v-model="reviewDialog" lazy absolute>
            <v-btn slot="activator" small fixed bottom fab class="amber white--text"><v-icon>add</v-icon></v-btn>
            <v-card class="write-review">
              <v-card-title>
                <div class="headline">Write a review</div>
              </v-card-title>
              <v-card-text v-if="!isAuthenticated">Please, <a href="#" @click="login">login</a> to send the review</v-card-text>
              <form id="user-review" name="user-review" v-on:submit.prevent="">
                <v-card-text>
                  <star-rating :stars="userStars" v-on:updateStars="updateStars"></star-rating>
                  <div class="warning" v-show="formError">Please, rate this place</div>
                    <input type="hidden" name="stars" v-model="userStars">
                    <v-text-field
                      name="body"
                      label="Tell us your experience"
                      multi-line
                      :disabled="!isAuthenticated"
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn class="green--text darken-1" flat="flat" @click.native="reviewDialog = false">Cancel</v-btn>
                  <v-btn type="submit" class="green--text darken-1" flat="flat" @click.native="sendReview" :disabled="!isAuthenticated">Send</v-btn>
                </v-card-actions>
              </form>
            </v-card>
          </v-dialog>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
  var StarRating = {
    template: '<span class="stars amber--text text--lighten-1"><v-btn icon v-for="n in stars" :key="n" :class="[\'star--\' + n]" class="amber--text text--lighten-1" @click="updateStars(n)"><v-icon>star</v-icon></v-btn><v-btn icon v-for="n in (5 - stars)" :key="n+stars" :class="[\'star--\' + (n+stars)]" @click="updateStars(n+stars)"><v-icon>star_border</v-icon></v-btn></span>',
    props: {
      stars: {
        type: Number,
        validator: function (value) {
          return value <= 6
        }
      }
    },
    methods: {
      updateStars (number) {
        this.$emit('updateStars', number)
      }
    }
  }
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
        placeInfo: undefined,
        reviewDialog: false,
        userStars: 0,
        formError: false
      }
    },
    components: {
      'star-display': StarDisplay,
      'star-rating': StarRating
    },
    created () {
      this.placeInfo = this.$store.state.places[this.$route.params.id]
    },
    watch: {
      '$route' (to, from) {
        if (to.name === 'place' && from.name === 'place') {
          this.placeInfo = this.$store.state.places[this.$route.params.id]
          if (this.showFull === true) {
            this.showFullCard()
          }
        }
      },
      showBottomDrawer () {
        this.goBackToMap()
      }
    },
    computed: {
      stars () {
        if (typeof this.placeInfo.stars === 'undefined') return 0
        return Math.floor(this.placeInfo.stars)
      },
      isAuthenticated () {
        return this.$auth.isAuthenticated()
      }
    },
    methods: {
      slideUp () {
        this.showFullCard()
      },
      onClick () {
        this.showFullCard()
      },
      slideDown () {
        this.showFull = false
      },
      goBackToMap () {
        this.$router.push('/')
      },
      showFullCard () {
        this.fetchFromApi(this.placeInfo._links.self.href)
        this.showFull = true
      },
      fetchFromApi (uri) {
        this.$http.get(uri)
        .then((response) => {
          this.handleApiPlaceResponse(response)
        }).catch((error) => {
          console.log(error)
        })
      },
      handleApiPlaceResponse (response) {
        this.placeInfo = response.body
      },
      updateStars (data) {
        this.userStars = data
        this.formError = false
      },
      sendReview () {
        console.log('send review')
        if (this.userStars < 1) {
          this.formError = true
          return
        }
        this.$http.post(this.placeInfo._links.self.href + '/reviews', {body: this.body, stars: this.userStars})
        .then((response) => {
          this.placeInfo.reviews = response.body._embedded.reviews
          this.body = ''
          this.userStars = 0
          this.reviewDialog = false
        }).catch((error) => {
          console.log(error)
        })
      },
      login () {
        this.$auth.login()
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

  .stars button {
    margin: 0;
  }

  .place-card {
    pointer-events: all;
    cursor: pointer;
    overflow-y: auto;
  }

  #place-card-container.fullheight .place-card {
    height: 100vh !important;
  }

  #place-card-container { 
    width: 100%;
    position: absolute;
    pointer-events: none;
    bottom: 0;
  }

  #place-card-container.fullheight {
    top: 0;
    z-index: 1;
  }

</style>