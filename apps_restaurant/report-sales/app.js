module.exports = function init(site) {
  const $item_transaction = site.connectCollection("item_transaction")

  site.get({
    name: "report_sales",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_sales/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    } else if (where && where.date_from) {
      let d1 = site.toDate( where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to
    } else if (where.date_today) {
      let d1 = site.toDate(new Date())
      let d2 = site.toDate(new Date())
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    where['transaction_type'] = 'out'
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $item_transaction.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        let item_size = []
        docs.forEach(doc => {
          let exist = false
          if (item_size.length > 0)
            item_size.forEach(size => {
              if (size.barcode == doc.barcode) {
                size.count = size.count + doc.count
                exist = true
              }
            });
          if (!exist) item_size.push(doc)
        })
        response.list = item_size
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}