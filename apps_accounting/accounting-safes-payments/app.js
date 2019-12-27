module.exports = function init(site) {

  const $safes_payments = site.connectCollection("safes_payments")

  site.on('[safes][safes_payments][+]', info => {
    let obj = {
      safe: info.safe,
      payment_method: info.payment_method,
      value: info.value || '',
      date: info.date || info.safe.date,
      source: info.operation,
      transition_type: info.transition_type,
      company: info.company,
      branch: info.branch,
      balance: info.balance || info.safe.balance,
      image_url: info.image_url || info.safe.image_url,
      pre_balance: info.pre_balance,
      sourceName: info.sourceName || '',
      description: info.description || '',
      notes: info.notes || '',
      code: info.code || ''
    }
    $safes_payments.add(obj)
  })

  site.on('[safes][safes_payments][-]', info => {

    let obj = {
      safe: info.safe,
      payment_method: info.payment_method,
      value: info.value,
      date: info.date,
      source: info.operation,
      transition_type: info.transition_type,
      balance: info.balance,
      image_url: info.image_url,
      company: info.company,
      branch: info.branch,
      pre_balance: info.pre_balance,
      sourceName: info.sourceName || '',
      description: info.description || '',
      notes: info.notes || '',
      code: info.code || ''
    }
    $safes_payments.add(obj)
  })

  site.get({
    name: "safes_payments",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/safes_payments/all", (req, res) => {
    let response = {}
    response.done = false

    let where = req.body.where || {}

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

    if (where['source']) {
      where['source'] = new RegExp(where['source'], 'i')
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $safes_payments.findMany({
      select: req.body.select || {},
      where: where,
      limit: req.body.limit,
      sort: {
        id: -1
      }
    }, (err, docs) => {
      if (!err) {
        response.done = true
        response.list = docs

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })









}