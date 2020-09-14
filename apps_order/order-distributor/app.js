module.exports = function init(site) {
  const $order_invoice = site.connectCollection("order_invoice")

  site.get({
    name: "order_distributor",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/order_distributor/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let order_invoice_doc = req.body
    order_invoice_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (order_invoice_doc.id) {
      $order_invoice.edit({
        where: {
          id: order_invoice_doc.id
        },
        set: order_invoice_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err, result) {
          response.done = true
        } else {
          response.error = 'Code Already Exist'
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/order_distributor/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    };

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    };

    if (where['shift_code']) {
      where['shift.code'] = site.get_RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lte': d2
      }
    } else if (where && where.date_from) {
      let d1 = site.toDate( where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lte': d2
      }
      delete where.date_from
      delete where.date_to
    }

    if (where['delivery_employee']) {
      where['delivery_employee.id'] = where['delivery_employee'].id;
      delete where['delivery_employee']
    };

    where['status.id'] = 2
    where['transaction_type.id'] = 2
    where['status_delivery.id'] = 1

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (req.session.user && req.session.user.type === 'delivery') {
      where['delivery_employee.user_info.id'] = req.session.user.id;
    };

    $order_invoice.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.list = docs
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}