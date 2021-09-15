module.exports = function init(site) {
  const $test = site.connectCollection("test")
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "/",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


}