module.exports = function init(site) {
  const $financial_years = site.connectCollection("financial_years")

  $financial_years.deleteDuplicate({
    code: 1,
    'company.id': 1
  }, (err, result) => {
    $financial_years.createUnique({
      code: 1,
      'company.id': 1
    }, (err, result) => { })
  })

  site.get({
    name: "financial_years",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post({
    name: "/api/years_status/all",
    path: __dirname + "/site_files/json/years_status.json"

  })

  site.post("/api/financial_years/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let financial_years_doc = req.body
    financial_years_doc.$req = req
    financial_years_doc.$res = res
    financial_years_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    financial_years_doc.company = site.get_company(req)
    financial_years_doc.branch = site.get_branch(req)

    $financial_years.add(financial_years_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
        site.reload_numbering(req);
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/financial_years/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let financial_years_doc = req.body
    financial_years_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (financial_years_doc.id) {
      $financial_years.edit({
        where: {
          id: financial_years_doc.id
        },
        set: financial_years_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
          site.changeNumberFinancial({req:req,code:result.doc.code,accounting_period_list:result.doc.accounting_period_list});
          site.reload_numbering(req);
        } else {
          response.error = err.message
        }
        res.json(response)
      })

    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/financial_years/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $financial_years.findOne({
      where: {
        id: req.body.id
      }
    }, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/financial_years/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id

    if (id) {
      $financial_years.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
          site.reload_numbering(req);
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/financial_years/all", (req, res) => {
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
      where['code'] = new RegExp(where['code'], 'i')
    }
    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }
    if (where.search && where.search.period) {
      where['search.period'] = where.search.period;
      delete where.search
    }
    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $financial_years.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
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





  site.post("/api/financial_years/is_allowed_date", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $financial_years.findMany({
      where: {
        'status.id': 2,
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code
      }
    }, (err, docs, count) => {
      if (!err) {
        response.done = true

        response.doc = false
        docs.forEach(doc => {
          if (new Date(doc.period_start.date).getTime() <= new Date(req.body.date).getTime() && new Date(doc.period_end.date).getTime() >= new Date(req.body.date).getTime()) {
            doc.accounting_period_list.forEach(element => {
              if (new Date(element.start.date).getTime() <= new Date(req.body.date).getTime() && new Date(element.end.date).getTime() >= new Date(req.body.date).getTime() && element.status.name == 'opend') {
                response.doc = true
              }
            })
          }
        })

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.is_allowed_date = function (option, callback) {

    callback = callback || function () { }


    $financial_years.findMany({
      where: {

        'status.id': 2, 
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code
      }
    }, (err, docs, count) => {

      let response = false

      docs.forEach(doc => {
        if (new Date(doc.period_start.date).getTime() <= new Date(option.date).getTime() && new Date(doc.period_end.date).getTime() >= new Date(option.date).getTime()) {
          doc.accounting_period_list.forEach(element => {
            if (new Date(element.start.date).getTime() <= new Date(option.date).getTime() && new Date(element.end.date).getTime() >= new Date(option.date).getTime() && element.status.name == 'opend') {
              response = true
            }
          })
        }
      })


      callback(err, response)
    })

    return true

  }


}