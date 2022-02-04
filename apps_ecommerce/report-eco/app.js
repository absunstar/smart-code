module.exports = function init(site) {

  // $report_eco.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $report_eco.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // })

  site.post({
    name: "/api/report_eco/delivery_agency/all",
    path: __dirname + "/site_files/json/delivery_agency.json",
  });

  
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