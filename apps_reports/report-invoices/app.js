module.exports = function init(site) {
  const $account_invoices = site.connectCollection("account_invoices")

  site.get({
    name: "report_invoices",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.post("/api/report_invoices/all", (req, res) => {
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

    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method']
    }

    if (where['source_type']) {
      where['source_type.id'] = where['source_type'].id;
      delete where['source_type']
    }

    if (where['order_invoices_type']) {
      where['order_invoices_type.id'] = where['order_invoices_type'].id;
      delete where['order_invoices_type']
    }

    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer']
    }

    if (where['vendor']) {
      where['vendor.id'] = where['vendor'].id;
      delete where['vendor']
    }

    if (where['school_year']) {
      where['school_year.id'] = where['school_year'].id;
      delete where['school_year']
    }

    if (where['students_years']) {
      where['students_years.id'] = where['students_years'].id;
      delete where['students_years']
    }

    if (where['target_account']) {
      where['target_account.id'] = where['target_account'].id;
      delete where['target_account']
    }

    if (where['types_expenses']) {
      where['types_expenses.id'] = where['types_expenses'].id;
      delete where['types_expenses']
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
        response.remain_amount = 0
        response.total_value_added = 0
        response.net_value = 0
        response.total_tax = 0
        response.total_discount = 0
        response.cash = 0
        response.bank = 0
        docs.forEach((_invoice) => {
          _invoice.total = _invoice.net_value - _invoice.total_value_added;
          _invoice.total = site.toNumber(_invoice.total);
          _invoice.net_value = site.toNumber(_invoice.net_value);
          _invoice.paid_up = site.toNumber(_invoice.paid_up);
          _invoice.remain_amount = site.toNumber(_invoice.remain_amount);
          _invoice.total_discount = site.toNumber(_invoice.total_discount);
          _invoice.total_tax = site.toNumber(_invoice.total_tax);

          response.remain_amount += site.toNumber(_invoice.remain_amount);
          response.total_value_added += site.toNumber(_invoice.total_value_added);
          response.net_value += site.toNumber(_invoice.net_value);
          response.total_tax += site.toNumber(_invoice.total_tax);
          response.total_discount += site.toNumber(_invoice.total_discount);

          if (_invoice.payment_method) {
            if (_invoice.payment_method.id === 1) response.cash += site.toNumber(_invoice.paid_up);
            else response.bank += site.toNumber(_invoice.paid_up);
          }
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