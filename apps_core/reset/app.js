module.exports = function init(site) {
  const $reset = site.connectCollection("reset")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "reset",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })
}