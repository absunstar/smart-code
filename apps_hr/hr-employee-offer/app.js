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
    if (req.session.user === undefined) {
      res.json(response)
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
    if (req.session.user === undefined) {
      res.json(response)
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
    if (req.session.user === undefined) {
      res.json(response)
    }
    let _id = req.body._id
    if (_id) {
      $employee_offer.delete({
        _id: $employee_offer.ObjectID(_id),
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err && result.ok) {


          let Obj = {
            value: result.doc.value,
            safe: result.doc.safe,
            company: result.doc.company,
            branch: result.doc.branch,
            date: result.doc.date,
            sourceName: result.doc.employee.name
          }
          if (Obj.value && Obj.safe && Obj.date && Obj.sourceName) {
            site.call('[employee_offer][safes][-]', Obj)
          }


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


}