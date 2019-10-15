module.exports = function init(site) {

  const $employees_advances = site.connectCollection("hr_employees_advances")

  site.on('[employees_advances_fin][employees_advances][-]', function (obj) {

    $employees_advances.find({
      'employee.id': obj.employee.id
    }, (err, doc) => {
      if (!err && doc) {
        doc.value = doc.value || 0
        doc.value = parseFloat(doc.value) - parseFloat(obj.value)
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
          date: doc.date,
          sourceName: doc.employee.name,
          description: doc.description,
          company: doc.company,
          branch: doc.branch
        }
        if (Obj.value && Obj.safe && Obj.date && Obj.sourceName) {
          site.call('[employees_advances][safes][+]', Obj)
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
            date: result.doc.date,
            company: result.doc.company,
            branch: result.doc.branch,
            sourceName: result.doc.employee.name,
            description: result.doc.description

          }
          if (Obj.value && Obj.safe && Obj.date && Obj.sourceName) {
            site.call('[employees_advances][safes][-]', Obj)
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

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    } else if (where && where.from_date) {
      let d1 = site.toDate(where.from_date)
      let d2 = site.toDate(where.to_date)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.from_date
      delete where.to_date
    }

    if (where.search && where.search.date) {
      let d1 = site.toDate(where.search.date)
      let d2 = site.toDate(where.search.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where && where.search && where.search.from_date) {
      let d1 = site.toDate(where.search.from_date)
      let d2 = site.toDate(where.search.to_date)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }


    if (where.search && where.search.employee) {      
      where['employee.id'] = where.search.employee.id
    }

    if (where['description']) {
      where['description'] = new RegExp(where['description'], 'i')
    }


    if (where.search && where.search.value) {

      where['value'] = where.search.value
    }

    delete where.search

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $employees_advances.findMany({
      select: req.body.select || {},
      where: where,
      sort: {
        id: -1
      },
      limit: req.body.limit,

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