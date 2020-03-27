module.exports = function init(site) {

  const $safes = site.connectCollection("safes")

  site.on('[company][created]', doc => {

    $safes.add({
      name: "خزينة إفتراضي",
      balance: 0,
      type: {
        id: 1,
        en: "Cash",
        ar: "كاش"
      },
      image_url: '/images/safe.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, _doc) => {
      $safes.add({
        name: "خزينة بنك إفتراضية",
        balance: 0,
        type: {
          id: 2,
          en: "Bank",
          ar: "بنك"
        },
        image_url: '/images/safe.png',
        company: {
          id: doc.id,
          name_ar: doc.name_ar
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar
        },
        active: true
      })
    })
  })



  s_balance_list = []
  site.on('[amounts][safes][+]', obj => {
    s_balance_list.push(Object.assign({}, obj))
  })

  function s_balance_handle(obj) {
    if (obj == null) {
      if (s_balance_list.length > 0) {
        obj = s_balance_list[0]
        s_balance_handle(obj)
        s_balance_list.splice(0, 1)
      } else {
        setTimeout(() => {
          s_balance_handle(null)
        }, 1000);
      }
      return
    }

    $safes.find({
      id: obj.safe.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.pre_balance = doc.balance
        if (obj.transition_type == 'in')
          doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
        if (obj.transition_type == 'out')
          doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
        doc.description = obj.description
        $safes.update(doc, (err, result) => {

          if (!err) {
            $safes.find({
              id: result.doc.id
            }, (err, doc) => {
              obj.pre_balance = doc.pre_balance
              obj.image_url = doc.image_url
              obj.company = doc.company
              obj.branch = doc.branch
              obj.balance = doc.balance

              site.call('[safes][safes_payments][+]', obj)
            })
          }
          s_balance_handle(null)
        })
      }
    })
  }

  s_balance_handle(null)



  $safes.deleteDuplicate({
    name: 1,
    'company.id': 1
  }, (err, result) => {
    $safes.createUnique({
      name: 1,
      'company.id': 1

    }, (err, result) => {

    })
  })

  site.get({
    name: "safes",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post({
    name: "/api/safe_type/all",
    path: __dirname + "/site_files/json/safe_type.json"
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/safes/add", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    let safes_doc = req.body
    safes_doc.$req = req
    safes_doc.$res = res
    safes_doc.balance = site.toNumber(safes_doc.balance)
    safes_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    safes_doc.company = site.get_company(req)
    safes_doc.branch = site.get_branch(req)

    $safes.add(safes_doc, (err, doc) => {
      if (!err) {

        let obj = {
          image_url: doc.image_url,
          operation: 'خزينة جديدة',
          pre_balance: 0,
          balance: doc.balance,
          currency: doc.currency,
          company: doc.company,
          branch: doc.branch,
          value: doc.balance,
          safe: {
            name: doc.name,
            id: doc.id
          },
          date: new Date(),
          transition_type: 'in',
          shift: {
            id: doc.shift.id,
            code: doc.shift.code,
            name: doc.shift.name
          }
        }
        site.call('[safes][safes_payments][+]', obj)
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/safes/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    let safes_doc = req.body
    safes_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    safes_doc.employee = site.fromJson(safes_doc.employee)
    if (safes_doc._id) {
      $safes.edit({
        where: {
          _id: safes_doc._id
        },
        set: safes_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/safes/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }


    let id = req.body.id
    if (id) {
      $safes.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true

          site.call('delete safe payment', id)

        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/safes/view", (req, res) => {
    let response = {}
    response.done = false
    $safes.findOne({
      where: {
        _id: site.mongodb.ObjectID(req.body._id)
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

  site.post("/api/safes/all", (req, res) => {
    let response = {}
    response.done = false
    let where = req.body.where || {}


    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }
    if (where['description']) {
      where['description'] = new RegExp(where['description'], 'i')
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $safes.findMany({
      select: req.body.select || {},
      sort: {
        id: -1
      },
      limit: req.body.limit,

      where: where
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