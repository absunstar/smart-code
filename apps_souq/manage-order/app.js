module.exports = function init(site) {

  // $manage_order.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $manage_order.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // })


  site.post({
    name: '/api/order_status/all',
    path: __dirname + '/site_files/json/order_status.json',
  });

  site.get({
    name: "manage_order",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

}