module.exports = function init(site) {
  const $test = site.connectCollection("test")
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: 'css',
    path: __dirname + '/site_files/css/'
  })

  site.get({
    name: 'js',
    path: __dirname + '/site_files/js/'
  })

  site.get({
    name: 'webfonts',
    path: __dirname + '/site_files/webfonts/'
  })

  site.get({
    name: 'fonts',
    path: __dirname + '/site_files/fonts/'
  })

  site.get({
    name: "/",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


}