<template>
  <v-app id="sedientos" toolbar>
    <v-navigation-drawer absolute temporary light v-model="drawer" overflow>
      <v-toolbar flat class="transparent">
        <v-list class="pa-0" v-if="!isAuthenticated">
          <v-list-tile avatar tag="div" @click="login">
            <v-list-tile-avatar>
              <v-icon>account_circle</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>Login</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-list class="pa-0" v-else>
          <v-list-tile avatar tag="div">
            <v-list-tile-avatar>
              <img src="https://randomuser.me/api/portraits/men/85.jpg" />
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title> {{ userName }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-list class="pt-0" dense>
        <v-divider></v-divider>
        <v-list-tile v-for="item in items" :key="item.title" :to="item.to" :href="item.href">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="isAuthenticated" @click="logout">
          <v-list-tile-action>
            <v-icon class="grey--text text--lighten-1">power_settings_new</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>logout</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <main>
      <v-container fluid>
        <v-toolbar temporary floating id="main-toolbar">
          <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
          <!-- <v-text-field prepend-icon="search" hide-details single-line></v-text-field> -->
          <v-btn icon @click.stop="centerOnUserLocation">
            <v-icon>my_location</v-icon>
          </v-btn>
          <v-btn icon @click.stop="searchHere">
            <v-icon>search</v-icon>
          </v-btn>
        </v-toolbar>
        <router-view></router-view>
      </v-container>
    </main>
  </v-app>
</template>


<script>
  import { EventBus } from '@/components/EventBus'
  export default {
    data () {
      return {
        drawer: false,
        fixed: false,
        items: [
              { icon: 'bubble_chart', title: 'Login with google', href: 'https://dev-723162.oktapreview.com/oauth2/v1/authorize?idp=0oac1l3r3vicZn7X00h7&client_id=0oac1a92m9FJX1gnI0h7&response_type=id_token&response_mode=fragment&scope=openid&nonce=sedientos&state=mystate&redirect_uri=https%3A%2F%2Fsedientos.herokuapp.com%2Fcallback' }
        ],
        mini: false,
        right: true,
        title: 'Vuetify.js'
      }
    },
    methods: {
      login () {
        this.$auth.login()
      },
      logout () {
        this.$auth.logout()
      },
      centerOnUserLocation () {
        EventBus.$emit('recenter')
      },
      searchHere () {
        EventBus.$emit('search')
      }
    },
    computed: {
      isAuthenticated () {
        return this.$store.state.auth.isLoggedIn
      },
      userName () {
        return this.$store.state.user.name
      }
    }
  }
</script>

<style lang="stylus">
  @import './stylus/main'

  body {
    overflow: hidden;
  }

  #sedientos .container {
    padding: 0;
  }

  #main-toolbar {
    z-index: 1;
    /** I'm sorry, but vuetify injects "margin-top:0" in the element style **/
    margin: 16px !important; 
  }

</style>
