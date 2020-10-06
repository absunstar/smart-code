module.exports = function init(site) {
  const $account_invoices = site.connectCollection("account_invoices")

  site.get({
    name: "report_invoices_payments",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_invoices_payments/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};

    let date1 = undefined
    let date_from = undefined
    let date_to = undefined
    let shift_code = undefined

    if (req.data.where) {
      if (req.data.where.date) date1 = new Date(req.data.where.date)
      if (req.data.where.date_from) date_from = new Date(req.data.where.date_from)
      if (req.data.where.date_to) date_to = new Date(req.data.where.date_to)
      if (req.data.where.shift_code) shift_code = req.data.where.shift_code
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

    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer']

    }

    if (where['vendor']) {
      where['vendor.id'] = where['vendor'].id;
      delete where['vendor']

    }

    where['source_type.id'] = 1
    where['$or'] = [{ 'source_type.id': 1 }, { 'source_type.id': 9 }]

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
        let array = []

        docs.forEach(_doc => {
          _doc.payment_list.forEach(_p_l => {
            if ((_p_l.shift && shift_code === _p_l.shift.code) || (date1 && new Date(_p_l.date) >= new Date(date1) && new Date(_p_l.date) <= date1.setDate(date1.getDate() + 1)) || new Date(_p_l.date) <= new Date(date_to) && new Date(_p_l.date) >= new Date(date_from) || !date_from && !date_to && !date1 && !shift_code) {

              _p_l.code = _doc.code
              array.push(_p_l)

            }

          })
        })

        response.list = array
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}