module.exports = function init(site) {
  const $request_service = site.connectCollection("request_service")
  const $account_invoices = site.connectCollection("account_invoices")

  site.get({
    name: "report_subscribers",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.post("/api/report_subscribers/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

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

    if (where['trainer']) {
      where['trainer.id'] = where['trainer'].id;
      delete where['trainer']
    }

    if (where['order_subscribers_type']) {
      where['order_subscribers_type.id'] = where['order_subscribers_type'].id;
      delete where['order_subscribers_type']
    }

    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer']
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $request_service.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, request_docs, count) => {

      if (!err) {
        response.done = true
        $account_invoices.findMany({
          where: { 'source_type.id': 4 }
        }, (invoice_err, invoice_docs) => {
          if (!invoice_err) {
            request_docs.forEach(_request => {
              invoice_docs.forEach(_invoice => {
                if (_invoice.invoice_id == _request.id) {
                  _request.total_paid_up = _invoice.total_paid_up
                  _request.total_remain = _invoice.total_remain
                }

              });
              if (_request.total_remain == (null || undefined))
              _request.total_remain = _request.paid_require
            });
            response.list = request_docs
            response.count = count
          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })
  })

}