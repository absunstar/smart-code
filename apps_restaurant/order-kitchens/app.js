module.exports = function init(site) {
  const $order_invoice = site.connectCollection("order_invoice")

  site.get({
    name: "order_kitchen",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/order_kitchen/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let item = req.body
    $order_invoice.findOne({
      id: item.order.id,
    }, (err, doc) => {
      if (!err && doc) {
        response.done = true
        doc.items.forEach(items => {
          if (items.size_Ar == item.size_Ar && items.barcode === item.barcode)
            items.done_kitchen = true;
        });
        $order_invoice.update(doc)
      }
      res.json(response)

    })
  })

  site.post("/api/order_kitchen/active_all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let kitchen = {}
    let where = req.body.where || {}
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (where['kitchen']) {
      kitchen = where['kitchen']
      where['items.kitchen.id'] = where['kitchen'].id;
      delete where['kitchen']
    }
    where['$or'] = [{ 'items.done_kitchen': false }, { 'items.done_kitchen': undefined }]

    where['hold'] = { $ne: true }

    $order_invoice.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        let items_report = [];
        docs.forEach(_order => {
          _order.items.forEach(itm => {
            if (itm.kitchen && itm.kitchen.id === kitchen.id && !itm.done_kitchen) {
              itm.order = {
                code: _order.code,
                id: _order.id,
              }
              itm.table = _order.table
              items_report.push(itm);
            }
          });
        });

        response.list = items_report
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


}