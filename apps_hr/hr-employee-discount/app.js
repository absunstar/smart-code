module.exports = function init(site) {



  const $employee_discount = site.connectCollection("hr_employee_discount")

  site.get({
    name: "employee_discount",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })


  site.post("/api/employee_discount/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let employee_discount_doc = req.body
    employee_discount_doc.$req = req
    employee_discount_doc.$res = res
    employee_discount_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

    employee_discount_doc.date = new Date(employee_discount_doc.date)

    employee_discount_doc.company = site.get_company(req)
    employee_discount_doc.branch = site.get_branch(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'employees_discount',
      date: new Date(employee_discount_doc.date)
    };

    let cb = site.getNumbering(num_obj);
    if (!employee_discount_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      employee_discount_doc.code = cb.code;
    }


    $employee_discount.add(employee_discount_doc, (err, doc) => {

      if (!err) {

        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/employee_discount/update", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let employee_discount_doc = req.body
    employee_discount_doc.date = new Date(employee_discount_doc.date)
    if (employee_discount_doc._id) {
      $employee_discount.edit({
        where: {
          _id: employee_discount_doc._id
        },
        set: employee_discount_doc,
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

  site.post("/api/employee_discount/delete", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let _id = req.body._id
    if (_id) {
      $employee_discount.delete({
        _id: $employee_discount.ObjectId(_id),
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err && result.ok) {

          let Obj = {
            value: result.doc.value,
            safe: result.doc.safe,
            company: result.doc.company,
            branch: result.doc.branch,
            shift: {
              id: result.doc.shift.id,
              code: result.doc.shift.code,
              name_Ar: result.doc.shift.name_Ar, name_En: result.doc.shift.name_En
            },
            date: result.doc.date,
            transition_type: 'out',
            operation: { Ar: 'حذف خصم موظف', En: 'Delete Employee Discount' },

            source_name_Ar: result.doc.employee.name_Ar,
            source_name_en: result.doc.employee.name_En
          }
          if (Obj.value && Obj.safe && Obj.date) {
            site.quee('[amounts][safes][+]', Obj)
          }

          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/employee_discount/view", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $employee_discount.findOne({
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

  site.post("/api/employee_discount/all", (req, res) => {
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
      where.date = { '$gte': d1, '$lt': d2 }

    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = { '$gte': d1, '$lt': d2 }
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
      where['description'] = site.get_RegExp(where['description'], 'i')
    }

    if (where.search && where.search.value) {
      where['value'] = where.search.value
    }

    delete where.search


    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $employee_discount.findMany({
      select: req.body.select || {},
      where: where,
      sort: { id: -1 },
      limit: req.body.limit,
      limit: 0
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

  site.getEmployeesDiscounts = function (whereObj, callback) {
    callback = callback || {};
    let where = whereObj || {}

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

    if (where['shift_code']) {
      where['shift.code'] = where['shift_code']
      delete where['shift_code']
    }

    $employee_discount.findMany({
      where: where,
      sort: { id: -1 }

    }, (err, docs) => {
      if (!err && docs)
        callback(docs)
      else callback(false)

    })
  }

}