module.exports = function init(site) {
  const $login = site.connectCollection("login")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  
  site.get({
    name: 'css',
    path: __dirname + '/site_files/css/'
  })


  site.get({
    name: "login",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })
  



}