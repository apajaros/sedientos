import Vue from 'vue'
// import router from './router'
import store from './store'
import * as OktaAuth from '@okta/okta-auth-js/dist/okta-auth-js.min.js'

/**
 * @var{string} LOGIN_URL The endpoint for logging in. This endpoint should be proxied by Webpack dev server
 *    and maybe nginx in production (cleaner calls and avoids CORS issues).
 */
// const LOGIN_URL = '/auth'

/**
 * @var{string} REFRESH_TOKEN_URL The endpoint for refreshing an access_token. This endpoint should be proxied
 *    by Webpack dev server and maybe nginx in production (cleaner calls and avoids CORS issues).
 */
const REFRESH_TOKEN_URL = '/auth'

/**
 * TODO: This is here to demonstrate what an OAuth server will want. Ultimately you don't want to
 * expose a client_secret here. You want your real project backend to take a username/password
 * request and add the client secret on the server-side and forward that request
 * onto an OAuth server. Your backend acts as a middle-man in the process, which is better, for
 * example in situations like DDoS attacks.
 *
 * @var{Object} AUTH_BASIC_HEADERS The options to pass into a Vue-resource http call. Includes
 *    the headers used for login and token refresh and emulateJSON flag since we are hitting an
 *    OAuth server directly that can't handle application/json.
 */
const AUTH_BASIC_HEADERS = {
  headers: {
    'Authorization': 'Basic ZGVtb2FwcDpkZW1vcGFzcw==' // Base64(client_id:client_secret) "demoapp:demopass"
  },
  emulateJSON: true
}

var oktaAuth = new OktaAuth({
  url: 'https://dev-723162.oktapreview.com',
  clientId: '0oac1a92m9FJX1gnI0h7',
  issuer: 'https://dev-723162.oktapreview.com/oauth2/default',
  redirectUri: location.origin + '/callback'
})

/**
* Auth Plugin
*
* (see https://vuejs.org/v2/guide/plugins.html for more info on Vue.js plugins)
*
* Handles login and token authentication using OAuth2.
*/
export default {

  /**
   * Install the Auth class.
   *
   * Creates a Vue-resource http interceptor to handle automatically adding auth headers
   * and refreshing tokens. Then attaches this object to the global Vue (as Vue.auth).
   *
   * @param {Object} Vue The global Vue.
   * @param {Object} options Any options we want to have in our plugin.
   * @return {void}
   */
  install (Vue, options) {
    Vue.http.interceptors.push((request, next) => {
      console.log(request)
      const token = this.getAccessToken()
      const hasAuthHeader = request.headers.has('Authorization')

      if (token && !hasAuthHeader) {
        this.setAuthHeader(request)
      }

      next((response) => {
        if (this._isInvalidToken(response)) {
          return this._refreshToken(request)
        }
      })
    })

    Vue.prototype.$auth = Vue.auth = this
    // Vue.prototype.$oktaAuth = Vue.oktaAuth = oktaAuth
  },
  oktaAuth,

  isAuthenticated () {
    // Checks if there is a current accessToken in the TokenManger.
    return !!this.oktaAuth.tokenManager.get('accessToken')
  },

  /**
   * Login
   *
   * @param {Object.<string>} creds The username and password for logging in.
   * @param {string|null} redirect The name of the Route to redirect to.
   * @return {Promise}
   */
  // login (creds, redirect) {
  //   const params = { 'grant_type': 'password', 'username': creds.username, 'password': creds.password }

  //   return Vue.http.post(LOGIN_URL, params, AUTH_BASIC_HEADERS)
  //     .then((response) => {
  //       this._storeToken(response)

  //       if (redirect) {
  //         router.push({ name: redirect })
  //       }

  //       return response
  //     })
  //     .catch((errorResponse) => {
  //       return errorResponse
  //     })
  // },
  login () {
    // Launches the login redirect.
    this.oktaAuth.token.getWithRedirect({
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'email', 'profile']
    })
  },

  async handleAuthentication () {
    const tokens = await this.oktaAuth.token.parseFromUrl()
    let name
    tokens.forEach(token => {
      if (token.idToken) {
        this.oktaAuth.tokenManager.add('idToken', token)
      }
      if (token.accessToken) {
        this.oktaAuth.tokenManager.add('accessToken', token)
      }
      if (token.claims && token.claims.name) {
        name = token.claims.name
      }
    })
    const auth = store.state.auth
    const user = store.state.user

    auth.isLoggedIn = true
    // auth.accessToken = response.body.access_token
    // auth.refreshToken = response.body.refresh_token
    user.name = name

    store.commit('UPDATE_AUTH', auth)
    store.commit('UPDATE_USER', user)
  },

  getAccessToken () {
    // Return the token from the accessToken object.
    const accessToken = this.oktaAuth.tokenManager.get('accessToken')
    if (typeof accessToken !== 'undefined') {
      return accessToken.accessToken
    } else {
      return null
    }
  },

  /**
   * Logout
   *
   * Clear all data in our Vuex store (which resets logged-in status) and redirect back
   * to login form.
   *
   * @return {void}
   */
  /* logout () {
    store.commit('CLEAR_ALL_DATA')
    router.push({ name: 'login' })
  }, */
  async logout () {
    this.oktaAuth.tokenManager.clear()
    await this.oktaAuth.signOut()
    console.log('logged-out')
    const auth = store.state.auth
    const user = store.state.user

    auth.isLoggedIn = false
    user.name = null

    store.commit('UPDATE_AUTH', auth)
    store.commit('UPDATE_USER', user)
  },

  /**
   * Set the Authorization header on a Vue-resource Request.
   *
   * @param {Request} request The Vue-Resource Request instance to set the header on.
   * @return {void}
   */
  setAuthHeader (request) {
    request.headers.set('Authorization', 'Bearer ' + this.getAccessToken())
    // The demo Oauth2 server we are using requires this param, but normally you only set the header.
    /* eslint-disable camelcase */
    // request.params.access_token = store.state.auth.accessToken
  },

  /**
   * Retry the original request.
   *
   * Let's retry the user's original target request that had recieved a invalid token response
   * (which we fixed with a token refresh).
   *
   * @param {Request} request The Vue-resource Request instance to use to repeat an http call.
   * @return {Promise}
   */
  _retry (request) {
    this.setAuthHeader(request)

    return Vue.http(request)
      .then((response) => {
        return response
      })
      .catch((response) => {
        return response
      })
  },

  /**
   * Refresh the access token
   *
   * Make an ajax call to the OAuth2 server to refresh the access token (using our refresh token).
   *
   * @private
   * @param {Request} request Vue-resource Request instance, the original request that we'll retry.
   * @return {Promise}
   */
  _refreshToken (request) {
    const params = { 'grant_type': 'refresh_token', 'refresh_token': store.state.auth.refreshToken }

    return Vue.http.post(REFRESH_TOKEN_URL, params, AUTH_BASIC_HEADERS)
      .then((result) => {
        this._storeToken(result)
        return this._retry(request)
      })
      .catch((errorResponse) => {
        if (this._isInvalidToken(errorResponse)) {
          this.logout()
        }
        return errorResponse
      })
  },

  /**
   * Store tokens
   *
   * Update the Vuex store with the access/refresh tokens received from the response from
   * the Oauth2 server.
   *
   * @private
   * @param {Response} response Vue-resource Response instance from an OAuth2 server.
   *      that contains our tokens.
   * @return {void}
   */
  _storeToken (response) {
    const auth = store.state.auth
    const user = store.state.user

    auth.isLoggedIn = true
    auth.accessToken = response.body.access_token
    auth.refreshToken = response.body.refresh_token
    // TODO: get user's name from response from Oauth server.
    user.name = 'John Smith'

    store.commit('UPDATE_AUTH', auth)
    store.commit('UPDATE_USER', user)
  },

  /**
   * Check if the Vue-resource Response is an invalid token response.
   *
   * @private
   * @param {Response} response The Vue-resource Response instance received from an http call.
   * @return {boolean}
   */
  _isInvalidToken (response) {
    const status = response.status
    const error = response.data.error

    return (status === 401 && (error === 'invalid_token' || error === 'expired_token'))
  }
}
