module.exports = function init(site) {
  const $order_invoice = site.connectCollection("order_invoice")

  site.get({
    name: "order_kitchen",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/order_kitchen/update", (req, res) => {
    let item = req.body
    $order_invoice.findOne({
      id: item.order.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.book_list.forEach(book_list => {
          if (book_list.size == item.size && book_list.barcode == item.barcode)
            book_list.done_kitchen = true;
        });
        $order_invoice.update(doc)
      }
    })
  })

  site.post("/api/order_kitchen/active_all", (req, res) => {
    let response = {
      done: false
    }
    let kitchen = {}
    let where = req.body.where || {}
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
     where['status.id'] = 1
    if (where['kitchen']) {
      kitchen = where['kitchen']
      where['book_list.kitchen.id'] = where['kitchen'].id;
      delete where['kitchen']
    }

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

        let book_list_report = [];
        docs.forEach(order => {
          order.book_list.forEach(itm => {
            if (itm.kitchen && itm.kitchen.id === kitchen.id && !itm.done_kitchen) {
              itm.order = {
                code: order.code,
                id: order.id,
              }
              itm.table = order.table
              book_list_report.push(itm);
            }
          });
        });

        response.list = book_list_report
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


}