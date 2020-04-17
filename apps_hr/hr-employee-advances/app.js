module.exports = function init(site) {

  const $employees_advances = site.connectCollection("hr_employees_advances")

  site.on('[employees_advances_fin][employees_advances][-]', function (obj) {

    $employees_advances.find({
      'employee.id': obj.employee.id
    }, (err, doc) => {
      if (!err && doc) {
        doc.value = doc.value || 0
        doc.value = site.toNumber(doc.value) - site.toNumber(obj.value)
        $employees_advances.update(doc)
      }
    })
  })

  site.get({
    name: "employees_advances",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })


  site.post("/api/employees_advances/add", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let employees_advances_doc = req.body
    employees_advances_doc.$req = req
    employees_advances_doc.$res = res
    employees_advances_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    employees_advances_doc.date = new Date(employees_advances_doc.date)

    employees_advances_doc.company = site.get_company(req)
    employees_advances_doc.branch = site.get_branch(req)

    $employees_advances.add(employees_advances_doc, (err, doc) => {
      if (!err && doc) {

        let Obj = {
          value: doc.value,
          safe: doc.safe,
          currency: doc.currency,
          payment_method: doc.payment_method,
          date: doc.date,
          sourceName: doc.employee.name,
          description: doc.description,
          shift: {
            id: doc.shift.id,
            code: doc.shift.code,
            name: doc.shift.name
          },
          company: doc.company,
          transition_type: 'out',
          operation: ' سلفة موظف',
          branch: doc.branch
        }
        if (Obj.value && Obj.safe && Obj.date && Obj.sourceName) {
          site.call('[amounts][safes][+]', Obj)
        }

        site.call('[employees_advances][employees_advances_fin][+]', doc)


        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/employees_advances/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let employees_advances_doc = req.body
    employees_advances_doc.date = new Date(employees_advances_doc.date)
    if (employees_advances_doc._id) {
      $employees_advances.edit({
        where: {
          _id: employees_advances_doc._id
        },
        set: employees_advances_doc,
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

  site.post("/api/employees_advances/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let _id = req.body._id
    if (_id) {
      $employees_advances.delete({
        _id: $employees_advances.ObjectID(_id),
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err && result.ok) {

          let Obj = {
            value: result.doc.value,
            safe: result.doc.safe,
            currency: result.doc.currency,
            payment_method: result.doc.payment_method,
            date: result.doc.date,
            company: result.doc.company,
            branch: result.doc.branch,
            shift: result.doc.shift,
            sourceName: result.doc.employee.name,
            description: result.doc.description,
            shift: {
              id: result.doc.shift.id,
              code: result.doc.shift.code,
              name: result.doc.shift.name
            },
            operation: 'حذف سلفة موظف',
            transition_type: 'in'
          }
          if (Obj.value && Obj.safe && Obj.date && Obj.sourceName) {
            site.call('[amounts][safes][+]', Obj)
          }

          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/employees_advances/view", (req, res) => {
    let response = {}
    response.done = false
    $employees_advances.findOne({
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

  site.post("/api/employees_advances/all", (req, res) => {
    let response = {}
    response.done = false

    let where = req.body.where || {}
    let _limit = where.limit

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

    if (where && where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where && where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }


    if (where && where.employee) {
      where['employee.id'] = where.employee.id
    }

    if (where['description']) {
      where['description'] = new RegExp(where['description'], 'i')
    }


    if (where && where.value) {

      where['value'] = where.value
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    
    $employees_advances.findMany({
      select: req.body.select || {},
      where: where,
      sort: {
        id: -1
      },
      limit: _limit,

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