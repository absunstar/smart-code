module.exports = function init(site) {
  const $report_eco = site.connectCollection("report_eco")

  // $report_eco.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $report_eco.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // })

  site.get({
    name: "report_eco",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

}