module.exports = function init(site) {
  const $account_invoices = site.connectCollection("account_invoices")

  site.get({
    name: "report_safes",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.post("/api/report_safes/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}
    let safe = {}

    if (req.data.where && req.data.where.safe)
      safe = req.data.where.safe

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }
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

    if (where['shift_code']) {
      where['shift.code'] = site.get_RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }

    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method']
    }

    if (where['source_type']) {
      where['source_type.id'] = where['source_type'].id;
      delete where['source_type']
    }

    if (where['safe']) {
      where['payment_list.safe.id'] = where['safe'].id;
      delete where['safe']
    }

    if (where['order_invoices_type']) {
      where['order_invoices_type.id'] = where['order_invoices_type'].id;
      delete where['order_invoices_type']
    }

    where['posting'] = true
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $account_invoices.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true

        docs.forEach(_docs => {
          _docs.paid = 0
          _docs.commission = 0
          _docs.payment_list.forEach(_payment_list => {
            if (_payment_list.safe.id == safe.id) {
              _docs.paid += _payment_list.paid_up

              _docs.commission += (_payment_list.paid_up * (_payment_list.safe.commission || safe.commission) / 100)
            }
          });
          _docs.commission = site.toNumber(_docs.commission)
        });


        response.list = docs
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}