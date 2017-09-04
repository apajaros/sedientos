// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'default e2e tests': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#sedientos', 5000)
      .assert.elementPresent('.vue-map')
      // Google maps is loaded
      .assert.elementPresent('gm-style')
      // We should be able to count markers when using customized html
      .end()
  }
}
