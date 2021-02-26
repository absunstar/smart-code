module.exports = function init(site) {
  const $account_invoices = site.connectCollection("account_invoices")

  site.get({
    name: "report_payable_customers",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_payable_customers/all", (req, res) => {
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

    let date1 = undefined
    let date_from = undefined
    let date_to = undefined

    if (req.data.where) {
      if (req.data.where.date) date1 = new Date(req.data.where.date)
      if (req.data.where.date_from) date_from = new Date(req.data.where.date_from)
      if (req.data.where.date_to) date_to = new Date(req.data.where.date_to)
    }

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where['payable_list.date'] = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date

    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where['payable_list.date'] = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to
    }

    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer']

    } else where['customer.id'] = { $gte: 1 }

    where['remain_amount'] = { $gte: 1 }
    where['payable_list.value'] = { $gte: 1 }

    where['posting'] = true
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    $account_invoices.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err && docs && docs.length > 0) {
        let list = []
        docs.forEach(_doc => {
          _doc.payable_list = _doc.payable_list || []
          _doc.payable_list.forEach(_p => {

            if (_p.date && _p.value) {
              if ((date1 && new Date(_p.date) >= new Date(date1) && new Date(_p.date) <= date1.setDate(date1.getDate() + 1)) || (date_to && date_from && new Date(_p.date) <= new Date(date_to) && new Date(_p.date) >= new Date(date_from)) || (!date1 && !date_to && !date_from))
                list.push({
                  id: _doc.id,
                  image_url: _doc.image_url,
                  code: _doc.code,
                  customer: _doc.customer,
                  date: _doc.date,
                  due_date: _p.date,
                  source_type: _doc.source_type,
                  value: _p.value,
                })
            }
          });
        });
        response.done = true
        response.list = list
        response.count = count
      } else {
        response.error = 'Not Found'
      }
      res.json(response)
    })
  })

}