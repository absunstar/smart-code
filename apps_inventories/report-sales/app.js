module.exports = function init(site) {
  const $item_transaction = site.connectCollection("item_transaction")
  const $order_invoice = site.connectCollection('order_invoice')
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
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to
    }

    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }

    if (where['size']) {
      where['size'] = new RegExp(where['size'], 'i')
    }

    if (where['barcode']) {
      where['barcode'] = new RegExp(where['barcode'], 'i')
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
        let size_list = []
        docs.forEach(doc => {
          let exist = false
          if (size_list.length > 0)
            size_list.forEach(size => {
              if (size.barcode == doc.barcode) {
                size.count = size.count + doc.count
                exist = true
              }
            })
          if (!exist) size_list.push(doc)
        })
        response.list = size_list
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/report_sales2/all", (req, res) => {
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
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to
    }

    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }

    if (where['size']) {
      where['size'] = new RegExp(where['size'], 'i')
    }

    if (where['barcode']) {
      where['barcode'] = new RegExp(where['barcode'], 'i')
    }

    // where['transaction_type'] = 'out'
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

  
    $order_invoice.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        let size_list = []
        docs.forEach(doc => {
          let exist = false
          doc.book_list.forEach(itm =>{
            size_list.forEach(size => {
              if (size.barcode == itm.barcode) {
                size.count = size.count + itm.count
                exist = true
              }
            })
            if (!exist) size_list.push(itm)
          })
          
        })
        response.list = size_list
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}