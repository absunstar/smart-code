module.exports = function init(site) {
  const $attend_leave = site.connectCollection("attend_leave")



  $attend_leave.trackBusy = false
  site.on('zk attend', attend => {

    if ($attend_leave.trackBusy) {
      setTimeout(() => {
        site.call('zk attend', attend)
      }, 400);
      return
    }


    finger_id = attend.finger_id || 0

    site.getEmployeeAttend(finger_id.toString(), employeeCb => {
      if (!employeeCb) return;

      $attend_leave.findMany({
        where: { 'employee.id': employeeCb.id },
        limit: 1,
        sort: { id: -1 }
      }, (err, docs) => {

        let employeeDoc = null

        if (!err && docs.length == 1) employeeDoc = docs[0]
        site.getOpenShift({ companyId: employeeCb.company.id, branchCode: employeeCb.branch.code }, shiftCb => {

          let attend_time = {
            hour: new Date(attend.date).getHours(),
            minute: new Date(attend.date).getMinutes()
          }

          let can_check_in = false
          let can_check_out = false

          if (employeeDoc == null) can_check_in = true
          if (employeeDoc && employeeDoc.leave_date) can_check_in = true
          if (employeeDoc && employeeDoc.attend_date) can_check_out = true
          $attend_leave.trackBusy = true

          if (attend.check_status == "check_in" && can_check_in) {

            $attend_leave.add({
              image_url: '/images/attend_leave.png',
              employee: employeeCb,
              active: true,
              attend_date: new Date(attend.date),
              attend: attend_time,
              shift: shiftCb,
              company: employeeCb.company,
              branch: employeeCb.branch
            });

          } else if (attend.check_status == "check_out" && can_check_out) {

            let leave_time = {
              hour: new Date(attend.date).getHours(),
              minute: new Date(attend.date).getMinutes()
            }

            employeeDoc.leave_date = new Date(attend.date)
            employeeDoc.leave = leave_time
            $attend_leave.update(employeeDoc, () => {
              $attend_leave.trackBusy = false
            });
          }
        })
      })
    })
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
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


    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    if (where['name']) {
      where['employee.name'] = site.get_RegExp(where['name'], "i");
    }

    if (where.attend_date_to && where.attend_date_from) {
      let d1 = site.toDate(where.attend_date_from)
      let d2 = site.toDate(where.attend_date_to)
      d2.setDate(d2.getDate() + 1);
      where.attend_date = {
        '$gte': d1,
        '$lte': d2
      }
      delete where.attend_date_from
      delete where.attend_date_to
    }

    if (where.leave_date_to && where.leave_date_from) {
      let d1 = site.toDate(where.leave_date_from)
      let d2 = site.toDate(where.leave_date_to)
      d2.setDate(d2.getDate() + 1);
      where.leave_date = {
        '$gte': d1,
        '$lte': d2
      }
      delete where.leave_date_from
      delete where.leave_date_to
    }

    if (where.attend_date) {
      let d1 = site.toDate(where.attend_date)
      let d2 = site.toDate(where.attend_date)
      d2.setDate(d2.getDate() + 1)
      where.attend_date = {
        '$gte': d1,
        '$lte': d2
      }
    }

    if (where.leave_date) {
      let d1 = site.toDate(where.leave_date)
      let d2 = site.toDate(where.leave_date)
      d2.setDate(d2.getDate() + 1)
      where.leave_date = {
        '$gte': d1,
        '$lte': d2
      }
    }

    if (where.search && where.search.current) {
      where['current'] = where.search.current
    }

    delete where.search

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

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


  site.getAttendLeave = function (whereObj, callback) {
    callback = callback || {};
    let where = whereObj || {}
    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.attend_date = {
        '$gte': d1,
        '$lte': d2
      }
      delete where.date
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.attend_date = {
        '$gte': d1,
        '$lte': d2
      }
      delete where.date_from
      delete where.date_to
    }

    if (where['shift_code']) {
      where['shift.code'] = where['shift_code']
      delete where['shift_code']
    }

    $attend_leave.findMany({
      where: where
    }, (err, docs) => {
      if (!err && docs)
        callback(docs)
      else callback(false)

    })
  }

}