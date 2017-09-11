const VueGeolocation = {
  install (Vue) {
    // define the main instance function
    Vue.prototype.$getLocation = VueGeolocation.methods.getLocation
    Vue.prototype.$watchLocation = VueGeolocation.methods.watchLocation
    Vue.prototype.$clearWatch = VueGeolocation.methods.clearWatch
  },
  data () {
    return {
      watchId: null
    }
  },
  methods: {
    getLocation () {
      return new Promise((resolve, reject) => {
        if (!VueGeolocation._isAvailable()) {
          reject('no browser support')
        } else {
          window.navigator.geolocation.getCurrentPosition(
            position => {
              resolve(position)
            },
            () => {
              reject('no position access')
            }
          )
        }
      })
    },
    watchLocation (sucessFunction, errorFunction, options) {
      if (!VueGeolocation._isAvailable()) {
        throw Error('no browser support')
      } else {
        var geoOptions = options || {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 5000
        }

        this.watchId = navigator.geolocation.watchPosition(sucessFunction, errorFunction, geoOptions)
      }
    }
  },
  clearWatch () {
    window.navigator.geolocation.clearWatch(this.watchId)
  },
  _isAvailable () {
    return 'geolocation' in window.navigator
  }
}

export default VueGeolocation

// in-browser load
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueGeolocation)
}
