module.exports = function init(site) {
  const $oppenents_lawyers = site.connectCollection("oppenents_lawyers")

  site.get({
    name: "oppenents_lawyers",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post({
    name: "/api/blood_type/all",
    path: __dirname + "/site_files/json/blood_type.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.on('[attend_session][busy][+]', obj => {
    $oppenents_lawyers.findOne({
      where: { id: obj.oppenentId }
    }, (err, doc) => {
      if (obj.busy) doc.busy = true;
      else if (!obj.busy) doc.busy = false;
      if (!err && doc) $oppenents_lawyers.edit(doc)
    })
  })

  site.on('[register][oppenent][add]', doc => {

    $oppenents_lawyers.add({
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

  site.post("/api/oppenents_lawyers/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let oppenents_lawyers_doc = req.body
    oppenents_lawyers_doc.$req = req
    oppenents_lawyers_doc.$res = res

    oppenents_lawyers_doc.company = site.get_company(req)
    oppenents_lawyers_doc.branch = site.get_branch(req)

    $oppenents_lawyers.add(oppenents_lawyers_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/oppenents_lawyers/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let oppenents_lawyers_doc = req.body

    if (oppenents_lawyers_doc.id) {
      $oppenents_lawyers.edit({
        where: {
          id: oppenents_lawyers_doc.id
        },
        set: oppenents_lawyers_doc,
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

  site.post("/api/oppenents_lawyers/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $oppenents_lawyers.findOne({
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

  site.post("/api/oppenents_lawyers/delete", (req, res) => {
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
          $oppenents_lawyers.delete({
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

  site.post("/api/oppenents_lawyers/all", (req, res) => {
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

    $oppenents_lawyers.findMany({
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

    $oppenents_lawyers.findOne({
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