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
      company: obj.company,
      branch: obj.branch,
      balance: obj.balance || obj.safe.balance,
      image_url: obj.image_url || obj.safe.image_url,
      pre_balance: obj.pre_balance,
      sourceName: obj.sourceName || '',
      description: obj.description || '',
      notes: obj.notes || '',
      code: obj.code || ''
    }

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