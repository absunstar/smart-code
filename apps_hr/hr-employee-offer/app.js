module.exports = function init(site) {

  const $employee_offer = site.connectCollection("hr_employee_offer")

  site.get({
    name: "employee_offer",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/employee_offer/add", (req, res) => {
    let response = {}
    response.done = false
            
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let employee_offer_doc = req.body
    employee_offer_doc.$req = req
    employee_offer_doc.$res = res
    employee_offer_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    employee_offer_doc.date = new Date(employee_offer_doc.date)

    employee_offer_doc.company = site.get_company(req)
    employee_offer_doc.branch = site.get_branch(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'employees_offers',
      date: new Date(employee_offer_doc.date)
    };

    let cb = site.getNumbering(num_obj);
    if (!employee_offer_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      employee_offer_doc.code = cb.code;
    }

    $employee_offer.add(employee_offer_doc, (err, doc) => {

      if (!err) {


        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/employee_offer/update", (req, res) => {
    let response = {}
    response.done = false
            
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let employee_offer_doc = req.body
    employee_offer_doc.date = new Date(employee_offer_doc.date)
    if (employee_offer_doc._id) {
      $employee_offer.edit({
        where: {
          _id: employee_offer_doc._id
        },
        set: employee_offer_doc,
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

  site.post("/api/employee_offer/delete", (req, res) => {
    let response = {}
    response.done = false
            
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let _id = req.body._id
    if (_id) {
      $employee_offer.delete({
        _id: $employee_offer.ObjectId(_id),
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err && result.ok) {

          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/employee_offer/view", (req, res) => {
    let response = {}
    response.done = false
              
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $employee_offer.findOne({
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



  site.post("/api/employee_offer/all", (req, res) => {
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
      delete where.employee
    }

    if (where['description']) {
      where['description'] = site.get_RegExp(where['description'], 'i')
    }


    if (where && where.value) {

      where['value'] = where.value
    }

    


    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $employee_offer.findMany({
      select: req.body.select || {},
      where: where,
      limit: req.body.limit,

      sort: {
        id: -1
      },

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


  site.getEmployeesOffers = function (whereObj, callback) {
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

    $employee_offer.findMany({
      where: where,
      sort: { id: -1 }

    }, (err, docs) => {
      if (!err && docs)
        callback(docs)
      else callback(false)

    })
  }

}