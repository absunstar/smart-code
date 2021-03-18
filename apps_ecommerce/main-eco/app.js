module.exports = function init(site) {
  const $main_eco = site.connectCollection("main_eco")

  site.get({
    name: "main_eco",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

}