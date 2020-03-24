module.exports = function init(site) {
  const $customers = site.connectCollection("customers")

  site.get({
    name: "customers",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post({
    name: "/api/host/all",
    path: __dirname + "/site_files/json/host.json"

  })

  site.post({
    name: "/api/blood_type/all",
    path: __dirname + "/site_files/json/blood_type.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  customer_busy_list = []
  site.on('[attend_session][busy][+]', obj => {
    customer_busy_list.push(Object.assign({}, obj))
  })

  function customer_busy_handle(obj) {
    if (obj == null) {
      if (customer_busy_list.length > 0) {
        obj = customer_busy_list[0]
        customer_busy_handle(obj)
        customer_busy_list.splice(0, 1)
      } else {
        setTimeout(() => {
          customer_busy_handle(null)
        }, 1000);
      }
      return
    }

    $customers.findOne({
      where: { id: obj.customerId }
    }, (err, doc) => {

      if (obj.busy) doc.busy = true;
      else doc.busy = false;

      if (!err && doc) $customers.edit(doc, () => {
        customer_busy_handle(null)
      });

    })
  }
  customer_busy_handle(null)



  site.on('[company][created]', doc => {

    let name_ar = "عميل إفتراضي"

    if (site.feature('gym'))
      name_ar = "مشترك إفتراضي"

    $customers.add({
      group: {
        id: doc.id,
        name: doc.name
      },
      code: "1",
      name_ar: name_ar,
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
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc1) => { })
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
      }, (err, result) => {
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
    let data = { name: 'customer', id: req.body.id };

    site.getDataToDelete(data, callback => {

      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction'
        res.json(response)

      } else {
        if (id) {
          $customers.delete({
            id: id,
            $req: req,
            $res: res
          }, (err, result) => {
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
      }
    })
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
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'name_ar': new RegExp(search, "i")
      })
      where.$or.push({
        'name_en': new RegExp(search, "i")
      })
      where.$or.push({
        'mobile': new RegExp(search, "i")
      })

      where.$or.push({
        'phone': new RegExp(search, "i")
      })

      where.$or.push({
        'national_id': new RegExp(search, "i")
      })

      where.$or.push({
        'email': new RegExp(search, "i")
      })

    }

    if (where['name_ar']) {
      where['name_ar'] = new RegExp(where['name_ar'], 'i')
    }

    if (where['name_en']) {
      where['name_en'] = new RegExp(where['name_en'], 'i')
    }

    if (where.code) {

      where['code'] = where.code;
    }
    if (where.name_ar) {

      where['name_ar'] = new RegExp(where['name_ar'], 'i')
    }
    if (where.name_en) {

      where['name_en'] = new RegExp(where['name_en'], 'i')
    }
    if (where.nationality) {

      where['nationality'] = where.nationality;
    }

    if (where.phone) {

      where['phone'] = where.phone;
    }
    if (where.mobile) {

      where['mobile'] = where.mobile;
    }

    where['company.id'] = site.get_company(req).id


    $customers.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
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

  site.getCustomerAttend = function (data, callback) {

    let select = {
      id: 1, name_ar: 1,
      active: 1, finger_code: 1,
      busy: 1, child: 1, indentfy: 1,
      address: 1, mobile: 1, phone: 1,
      gov: 1, city: 1, area: 1,
      company: 1, branch: 1,
      weight: 1, tall: 1,
      blood_type: 1,
      medicine_notes: 1
    }

    let where = { finger_code: data }

    $customers.findOne({
      select: select,
      where: where,
    }, (err, doc) => {
      if (!err) {
        if (doc) callback(doc)
        else callback(false)
      }
    })
  }

}