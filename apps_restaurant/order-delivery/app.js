module.exports = function init(site) {
  const $order_invoice = site.connectCollection("order_invoice")

  site.get({
    name: "order_delivery",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/order_delivery/active_all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.body.where || {}
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code



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
        let under_preparing = [];
        let prepared = [];

        docs.forEach(_order => {
          if (_order.items && _order.items.length > 0) {
            let found = _order.items.every(_itm => _itm.done_kitchen)

            if (found) prepared.push(_order);
            else under_preparing.push(_order);
          }
        });

        response.under_preparing = under_preparing
        response.prepared = prepared
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


}