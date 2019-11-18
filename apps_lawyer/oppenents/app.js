module.exports = function init(site) {
  const $oppenents = site.connectCollection("oppenents")

  site.get({
    name: "oppenents",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.on('[attend_session][busy][+]', obj => {
    $oppenents.findOne({
      where: { id: obj.oppenentId }
    }, (err, doc) => {
      if (obj.busy) doc.busy = true;
      else if (!obj.busy) doc.busy = false;
      if (!err && doc) $oppenents.edit(doc)
    })
  })

  site.on('[register][oppenent][add]', doc => {

    $oppenents.add({
      group: {
        id: doc.id,
        name: doc.name
      },
      code: "1",
      name_ar: "عميل إفتراضي",
      // branch_list: [
      //   {
      //     charge: [{}]
      //   }
      // ],
      // currency_list: [],
      // opening_balance: [
      //   {
      //     initial_balance: 0
      //   }
      // ],
      // bank_list: [{}],
      // dealing_company: [{}],
      // employee_delegate: [{}],
      // accounts_debt: [{}],
      image_url: '/images/oppenent.png',
      company: {
        id: doc.company.id,
        name_ar: doc.company.name_ar
      },
      branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar
      },
      active: true
    }, (err, doc1) => { })
  })

  site.post("/api/oppenents/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let oppenents_doc = req.body
    oppenents_doc.$req = req
    oppenents_doc.$res = res

    oppenents_doc.company = site.get_company(req)
    oppenents_doc.branch = site.get_branch(req)

    $oppenents.add(oppenents_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/oppenents/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let oppenents_doc = req.body

    if (oppenents_doc.id) {
      $oppenents.edit({
        where: {
          id: oppenents_doc.id
        },
        set: oppenents_doc,
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

  site.post("/api/oppenents/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $oppenents.findOne({
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

  site.post("/api/oppenents/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id
    let data = { name: 'oppenent', id: req.body.id };

    site.getDataToDelete(data, callback => {

      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction'
        res.json(response)

      } else {
        if (id) {
          $oppenents.delete({
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

  site.post("/api/oppenents/all", (req, res) => {
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
    if (where['active'] !== 'all') {
      where['active'] = true
    } else {
      delete where['active']
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $oppenents.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
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

    let where = { finger_code : data }

    $oppenents.findOne({
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