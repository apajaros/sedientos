# sedientos

> A perfect way to calm your thirst

Sedientos is a Progressive Web App prototype to help you find bars near you. It is built using [Vue](https://vuejs.org) + [Vuetify](https://vuetifyjs.com). It relies on the [sedientos-server](https://github.com/apajaros/sedientos-server) API REST to retrieve and update data.

As a PWA, you can "install" it to your mobile home screen and use it offline (recently used data is cached).

You can find a live version in https://sedientos.herokuapp.com/ (please note that it may take a while to properly load, since the Heroku dynos will be probably asleep).

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
