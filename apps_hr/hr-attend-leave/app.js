module.exports = function init(site) {
  const $attend_leave = site.connectCollection("hr_attend_leave")
  const $employee_list = site.connectCollection("hr_employee_list")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post({
    name: "/api/times_attend_leave/all",
    path: __dirname + "/site_files/json/times_attend_leave.json"
  })

  site.post({
    name: "/api/status_now/all",
    path: __dirname + "/site_files/json/status_now.json"
  })

  site.post({
    name: "/api/attend_leave_employee/all",
    path: __dirname + "/site_files/json/attend_leave_employee.json"
  })

  site.get({
    name: "attend_leave",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/attend_leave/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let attend_leave_doc = req.body
    attend_leave_doc.$req = req
    attend_leave_doc.$res = res

    attend_leave_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof attend_leave_doc.active === 'undefined') {
      attend_leave_doc.active = true
    }

    attend_leave_doc.company = site.get_company(req)
    attend_leave_doc.branch = site.get_branch(req)

    $attend_leave.add(attend_leave_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/attend_leave/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let attend_leave_doc = req.body

    attend_leave_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (attend_leave_doc.id) {
      $attend_leave.edit({
        where: {
          id: attend_leave_doc.id
        },
        set: attend_leave_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = 'Code Already Exist'
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/attend_leave/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $attend_leave.findOne({
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

  site.post("/api/attend_leave/show", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = {}

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    let data = req.body

    let d1, d2 = null

    d1 = site.toDate(data.date)
    d2 = site.toDate(data.date)
    d2.setDate(d2.getDate() + 1)
    where['date'] = {
      $gte: d1,
      $lt: d2
    }


    $attend_leave.findOne(where, (err, doc) => {
      if (!err && doc) {
        response.done = true
        response.doc = doc
        res.json(response)
      } else {

        let doc2 = {
          date: req.body.date
        }

        let where = req.body.where || {}

        where['company.id'] = site.get_company(req).id
        where['branch.code'] = site.get_branch(req).code

        $employee_list.findMany({
          where: where
        }, (err, docs) => {

          doc2.employee_list = docs
          doc2.company = site.get_company(req)
          doc2.branch = site.get_branch(req)
          doc2.active = true
          doc2.image_url = '/images/attend_leave.png'

          $attend_leave.add(doc2, (err, new_doc) => {
            if (!err && new_doc) {
              response.done = true
              response.doc = new_doc
              res.json(response)
            }
          })
        })
      }
    })
  })

  site.post("/api/attend_leave/delete", (req, res) => {
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
      $attend_leave.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
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


  site.post("/api/attend_leave/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    } else if (where && where.date_from) {
      let d1 = site.toDate( where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to
    } else {
      let d1 = site.toDate(new Date())
      let d2 = site.toDate(new Date())
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    $attend_leave.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
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