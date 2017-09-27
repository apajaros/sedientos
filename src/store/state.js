// Set the key we'll use in local storage.
export const STORAGE_KEY = 'sedientos'

let initialState = {}

// Local storage sync state
if (localStorage.getItem(STORAGE_KEY)) {
  initialState = JSON.parse(localStorage.getItem(STORAGE_KEY))
} else {
  initialState = {
    auth: {
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null
    },
    user: {
      name: null
    },
    places: {},
    center: {lat: 40.4517299, lng: -3.6822692}
  }
}

// Other state (not synced in local storage)
initialState.appnav = {
  searchText: '',
  searchTimestamp: null
}

export const state = initialState
