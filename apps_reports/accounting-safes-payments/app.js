module.exports = function init(site) {

  const $safes_payments = site.connectCollection("safes_payments")


  site.on('delete safe payment', function (id) {

    $safes_payments.findMany({ 'safe.id': id }, (err, docs) => {

      if (docs.length === 1)
        $safes_payments.delete(docs[0]);
    });
  })



  site.on('[safes][safes_payments][+]', (obj, callback, next) => {

    let info = {
      safe: obj.safe,
      payment_method: obj.payment_method,
      shift: obj.shift,
      value: obj.value || '',
      date: obj.date || obj.safe.date,
      source: obj.operation,
      transition_type: obj.transition_type,
      currency: obj.currency,
      company: obj.company,
      branch: obj.branch,
      balance: obj.balance || obj.safe.balance,
      image_url: obj.image_url || obj.safe.image_url,
      pre_balance: obj.pre_balance,
      invoice_type: obj.invoice_type,
      sourceName: obj.sourceName || '',
      operation: obj.operation || '',
      description: obj.description || '',
      notes: obj.notes || '',
      code: obj.code || ''
    }

    info.pre_balance = site.toNumber(info.pre_balance)
    info.balance = site.toNumber(info.balance)

    $safes_payments.add(info, () => { 
      next()
    });

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

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.body.where || {}


    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method']
    }

    if (where['transition_type']) {

      where['transition_type'] = site.get_RegExp(where['transition_type.type'], 'i');
    }

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
      where['source'] = site.get_RegExp(where['source'], 'i')
    }


    if (where['value']) {
      where['value'] = where['value']
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


  site.post("/api/safes_payments/handel_safes_payments", (req, res) => {
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

    where['currency'] = null || undefined

    $safes_payments.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docs) => {
      if (!err) {
        response.done = true

        site.getDefaultSetting(req, callback => {

          let currency = {}
          if (callback.accounting.currency)
            currency = callback.accounting.currency

          if (currency.id)
            docs.forEach(_doc => {
              _doc.currency = currency
              _doc.pre_balance = site.toNumber(_doc.pre_balance)
              _doc.balance = site.toNumber(_doc.balance)
              $safes_payments.update(_doc)
            });
        })

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.post("/api/safes_payments/drop", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $safes_payments.deleteMany({
      'company.id': site.get_company(req).id,
      $req: req,
      $res: res
    } , ()=>{
      response.done = true
      res.json(response)
    });
  })


}