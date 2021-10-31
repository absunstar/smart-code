module.exports = function init(site) {

  site.get({
    name: "qr_storeout",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
    public : true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

}