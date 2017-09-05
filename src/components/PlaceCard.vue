<template>
 <v-bottom-sheet inset v-model="showBottomDrawer">
  <v-card tile  class="place-card" @click.stop="onClick" v-touch="{up: () => slideUp(), down: () => slideDown()}">
    <v-card-title>
      <h3 class="headline mb-0">
        {{ placeInfo.name }} | 
        <span>Caña: {{ placeInfo.price | formatPrice }}</span>
        <star-display :stars="stars"></star-display> <template v-if="placeInfo.reviews && placeInfo.reviews.length">({{placeInfo.reviews.length}})</template>
      </h3>
    </v-card-title>
    <v-slide-y-transition>
    <v-card-text v-show="showFull">
      <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.

Expetenda tincidunt in sed, ex partem placerat sea, porro commodo ex eam. His putant aeterno interesset at. Usu ea mundi tincidunt, omnium virtute aliquando ius ex. Ea aperiri sententiae duo. Usu nullam dolorum quaestio ei, sit vidit facilisis ea. Per ne impedit iracundia neglegentur. Consetetur neglegentur eum ut, vis animal legimus inimicus id.

His audiam deserunt in, eum ubique voluptatibus te. In reque dicta usu. Ne rebum dissentiet eam, vim omnis deseruisse id. Ullum deleniti vituperata at quo, insolens complectitur te eos, ea pri dico munere propriae. Vel ferri facilis ut, qui paulo ridens praesent ad. Possim alterum qui cu. Accusamus consulatu ius te, cu decore soleat appareat usu.

Est ei erat mucius quaeque. Ei his quas phaedrum, efficiantur mediocritatem ne sed, hinc oratio blandit ei sed. Blandit gloriatur eam et. Brute noluisse per et, verear disputando neglegentur at quo. Sea quem legere ei, unum soluta ne duo. Ludus complectitur quo te, ut vide autem homero pro.

Vis id minim dicant sensibus. Pri aliquip conclusionemque ad, ad malis evertitur torquatos his. Has ei solum harum reprimique, id illum saperet tractatos his. Ei omnis soleat antiopam quo. Ad augue inani postulant mel, mel ea qualisque forensibus</p>
    </v-card-text>
    </v-slide-y-transition>
  </v-card>
</v-bottom-sheet>
</template>

<script>
  var StarDisplay = {
    template: '<span class="stars" v-if="stars > 0"><i class="material-icons star" v-for="n in stars">star</i><i class="material-icons star" v-for="n in (5 - stars)">star_border</i></span>',
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
        this.$router.push('/')
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
        this.showFull = !this.showFull
      },
      slideDown () {
        this.showFull = false
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
  .stars .star {
    color: #dcba3e;
  }

  .place-card {
    cursor: pointer;
    transition-property: height;
    transition-duration: 1s;
    transition-timing-function: ease-out;
  }

</style>