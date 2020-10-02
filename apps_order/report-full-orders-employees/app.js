module.exports = function init(site) {
  const $order_invoice = site.connectCollection("order_invoice")

  site.get({
    name: "report_full_employees",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_full_employees/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};
    let employee = where.employee


    if (where['employee']) {
      where = {
        $or: [
          { 'add_user_info.id': where['employee'].user_info.id },
          { 'edit_user_info.id': where['employee'].user_info.id }
        ]
      }
      delete where['employee']
    }


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

    if (where['transaction_type']) {
      where['transaction_type.id'] = where['transaction_type'].id;
      delete where['transaction_type']
    }

    if (where['order_status']) {
      where['status.id'] = where['order_status'].id;
      delete where['order_status']
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
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lte': d2
      }
      delete where.date_from
      delete where.date_to
    }


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
        response.list = docs
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}