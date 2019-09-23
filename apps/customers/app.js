module.exports = function init(site) {
  const $customers = site.connectCollection("customers")

  site.get({
    name: "customers",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.on('[register][customer][add]', doc => {

    $customers.add({
      group:{
        id : doc.id,
        name : doc.name
      } ,
      code: "1",
      name_ar: "عميل إفتراضي",
      branch_list: [
        {
          charge: [{}]
        }
      ],
      currency_list: [],
      opening_balance: [
        {
          initial_balance: 0
        }
      ],
      bank_list: [{}],
      dealing_company: [{}],
      employee_delegate: [{}],
      accounts_debt: [{}],
      image_url: '/images/customer.png',
      company: {
        id: doc.company.id,
        name_ar: doc.company.name_ar
      },
      branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar
      },
      active : true
    }, (err, doc1) => {})
  })

  site.post("/api/customers/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let customers_doc = req.body
    customers_doc.$req = req
    customers_doc.$res = res
    
    customers_doc.company = site.get_company(req)
    customers_doc.branch = site.get_branch(req)

    $customers.add(customers_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/customers/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let customers_doc = req.body

    if (customers_doc.id) {
      $customers.edit({
        where: {
          id: customers_doc.id
        },
        set: customers_doc,
        $req: req,
        $res: res
      },(err , result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
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

  site.post("/api/customers/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $customers.findOne({
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

  site.post("/api/customers/delete", (req, res) => {
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
      $customers.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc=result.doc
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

  site.post("/api/customers/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['name_ar']) {
      where['name_ar'] = new RegExp(where['name_ar'], 'i')
    }
    
    if (where['name_en']) {
      where['name_en'] = new RegExp(where['name_en'], 'i')
    }
    if (where['active'] !== 'all') {
      where['active'] = true
    } else {
      delete where['active']
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    
    $customers.findMany({
      select: req.body.select || {},
      where: where ,
      sort: req.body.sort || {id:-1},
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

}