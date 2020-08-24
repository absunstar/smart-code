module.exports = function init(site) {

  const $employees_advances_fin = site.connectCollection("hr_employees_advances_fin")


  site.on('[employees_advances][employees_advances_fin][+]', function (obj) {

    let money = site.toNumber((obj.value / obj.period))

    for (let i = 0; i < obj.period; i++) {
      $employees_advances_fin.add({
        total: obj.period,
        payment_method: obj.payment_method,
        currency: obj.currency,
        employee: obj.employee,
        value: money,
        image_url: obj.image_url,
        company: obj.company,
        branch: obj.branch,
        date: obj.date
      })
    }

  })

  site.get({
    name: "employees_advances_fin",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })


  site.post("/api/employees_advances_fin/add", (req, res) => {
    let response = {}
    response.done = false
             
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let employees_advances_fin_doc = req.body
    employees_advances_fin_doc.$req = req
    employees_advances_fin_doc.$res = res

    employees_advances_fin_doc.date = new Date(employees_advances_fin_doc.date)


    employees_advances_fin_doc.company = site.get_company(req)
    employees_advances_fin_doc.branch = site.get_branch(req)

    $employees_advances_fin.add(employees_advances_fin_doc, (err, doc) => {
      if (!err) {


        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/employees_advances_fin/update", (req, res) => {
    let response = {}
    response.done = false
            
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let employees_advances_fin_doc = req.body
    employees_advances_fin_doc.date = new Date(employees_advances_fin_doc.date)
    if (employees_advances_fin_doc._id) {
      $employees_advances_fin.edit({
        where: {
          _id: employees_advances_fin_doc._id
        },
        set: employees_advances_fin_doc,
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

  site.post("/api/employees_advances_fin/delete", (req, res) => {
    let response = {}
    response.done = false
           
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let _id = req.body._id
    if (_id) {
      $employees_advances_fin.delete({
        _id: $employees_advances_fin.ObjectID(_id),
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err && result.ok) {

          let Obj = {
            value: result.doc.value,
            payment_method: result.doc.payment_method,
            currency: result.doc.currency,
            safe: result.doc.safe,
            company: result.doc.company,
            branch: result.doc.branch,
            date: result.doc.date,
            shift: {
              id: result.doc.shift.id,
              code: result.doc.shift.code,
              name: result.doc.shift.name
            },
            transition_type: 'out',
            operation: 'حذف سلفية موظف',
            sourceName: result.doc.employee.name
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

  site.post("/api/employees_advances_fin/view", (req, res) => {
    let response = {}
    response.done = false
              
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $employees_advances_fin.findOne({
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

  site.post("/api/employees_advances_fin/approved", (req, res) => {

    let response = {}
    response.done = false

            
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let doc = req.body
    doc.date = new Date(doc.date)

    if (doc.id) {
      $employees_advances_fin.edit({
        where: {
          id: doc.id
        },
        set: doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          site.call('[amounts][safes][+]', {
            value: doc.value,
            safe: doc.safe,
            sourceName: doc.employee.name,
            company: doc.company,
            branch: doc.branch,
            currency: doc.currency,
            payment_method: doc.payment_method,
            shift: doc.shift,
            date: doc.date,
            shift: {
              id: doc.shift.id,
              code: doc.shift.code,
              name: doc.shift.name
            },
            operation: 'سداد سلفة لموظف',
            transition_type: 'in',
            description: doc.description
          })
          site.call('[employees_advances_fin][employees_advances][-]', doc)


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


  site.post("/api/employees_advances_fin/all", (req, res) => {
    let response = {}
    response.done = false
          
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.body.where || {}

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }
    if (where && where.date_from) {
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




    if (where.search && where.search.date) {
      let d1 = site.toDate(where.search.date)
      let d2 = site.toDate(where.search.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where && where.search && where.search.date_from) {
      let d1 = site.toDate(where.search.date_from)
      let d2 = site.toDate(where.search.date_to)
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

    $employees_advances_fin.findMany({
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

  site.post("/api/employees_advances_fin/upload/image", (req, res) => {
    let response = {
      done: true
    }
    let file = req.files.fileToUpload
    let newName = "employees_advances_fin_doc_" + new Date().getTime() + ".png"
    let newpath = site.dir + "/../../uploads/erp/employees_advances_fin/images/" + newName
    site.mv(file.path, newpath, function (err) {
      if (err) {
        response.error = err
        response.done = false
      }
      response.image_url = "/employees_advances_fin/image/" + newName
      res.json(response)
    })
  })
  site.get("/employees_advances_fin/image/:name", (req, res) => {
    res.download(site.dir + "/../../uploads/erp/employees_advances_fin/images/" + req.params.name)
  })
}