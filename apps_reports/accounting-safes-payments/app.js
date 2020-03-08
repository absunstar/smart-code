module.exports = function init(site) {

  const $safes_payments = site.connectCollection("safes_payments")


  site.on('delete safe payment', function (id) {

    $safes_payments.findMany({ 'safe.id': id }, (err, docs) => {

      if (docs.length === 1)
        $safes_payments.delete(docs[0]);
    });
  });


  s_p_balance_list = []
  site.on('[safes][safes_payments][+]', obj => {
    s_p_balance_list.push(Object.assign({}, obj))
  })

  function s_p_balance_handle(obj) {
    if (obj == null) {
      if (s_p_balance_list.length > 0) {
        obj = s_p_balance_list[0]
        s_p_balance_handle(obj)
        s_p_balance_list.splice(0, 1)
      } else {
        setTimeout(() => {
          s_p_balance_handle(null)
        }, 1000);
      }
      return
    }

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

      s_p_balance_handle(null)
    });
  }
  s_p_balance_handle(null)




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


    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method']
    }

    if (where['transition_type']) {

      where['transition_type'] = new RegExp(where['transition_type.type'], 'i');
    }

    if (where['shift_code']) {
      where['shift.code'] = new RegExp(where['shift_code'], 'i')
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
      where['source'] = new RegExp(where['source'], 'i')
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

  site.safesPaymentsShift = function (shiftId, callback) {
    $safes_payments.findMany({
      where: { 'shift.id': shiftId }
    }, (err, docs) => {
      if (!err && docs)
        callback(docs)
      else callback(false)
    })
  }

}