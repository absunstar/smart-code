module.exports = function init(site) {
  const $barcode_printer = site.connectCollection("barcode_printer")
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "barcode_printer",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

}