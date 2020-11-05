module.exports = function init(site) {
  const $reset = site.connectCollection("reset")
  const $stores_out = site.connectCollection("stores_out")
  const $stores_in = site.connectCollection("stores_in")
  const $account_invoices = site.connectCollection("account_invoices")



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



  site.post("/api/stores_out/handel_invoices", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let whereStoreIn = {}

    whereStoreIn['company.id'] = site.get_company(req).id

    whereStoreIn['$or'] = [{ 'type.id': 3 }, { 'type.id': 4 }, { 'type.id': 6 }]

    $stores_out.findMany({
      select: req.body.select || {},
      where: whereStoreIn,
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docsStoreIn) => {
      if (!err) {



        let whereAccountInvoices = {}

        whereAccountInvoices['company.id'] = site.get_company(req).id
        whereAccountInvoices['source_type.id'] = 2

        $account_invoices.findMany({
          select: req.body.select || {},
          where: whereAccountInvoices,
          sort: req.body.sort || {
            id: -1
          },
        }, (err, docsAccountInvoices) => {
          if (!err) {




            console.log(docsAccountInvoices.length, "Ssssssssssssssssssssssssss");
            console.log(docsStoreIn.length, "wwwwwwwwwwwwwwwwwwwwww");




          }
        })

      }
      response.done = true
      res.json(response)
    })
  })









}