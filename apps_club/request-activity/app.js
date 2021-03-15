module.exports = function init(site) {
  const $request_activity = site.connectCollection("request_activity")


  // function addZero(code, number) {
  //   let c = number - code.toString().length
  //   for (let i = 0; i < c; i++) {
  //     code = '0' + code.toString()
  //   }
  //   return code
  // }

  // $request_activity.newCode = function () {

  //   let y = new Date().getFullYear().toString().substr(2, 2)
  //   let m = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][new Date().getMonth()].toString()
  //   let d = new Date().getDate()
  //   let lastCode = site.storage('ticket_last_code') || 0
  //   let lastMonth = site.storage('ticket_last_month') || m
  //   if (lastMonth != m) {
  //     lastMonth = m
  //     lastCode = 0
  //   }
  //   lastCode++
  //   site.storage('ticket_last_code', lastCode)
  //   site.storage('ticket_last_month', lastMonth)
  //   return 'R-S' + y + lastMonth + addZero(d, 2) + addZero(lastCode, 4)
  // }

  site.on('[attend_session][attend_request][+]', obj => {
    $request_activity.findOne({
      where: { id: obj.activity.id }
    }, (err, doc) => {
      if (doc) {

        if (doc.complex_activities_list && doc.complex_activities_list.length > 0) {
          doc.complex_activities_list.forEach(attend_activity => {
            if (attend_activity.id == obj.activity.activity_id) {
              attend_activity.current_attendance = attend_activity.current_attendance + 1;
              attend_activity.remain = attend_activity.remain - 1;
            }
          });
        } else {
          doc.current_attendance = doc.current_attendance + 1;
          doc.remain = doc.remain - 1;
        }
        doc.attend_activity_list = doc.attend_activity_list || []
        doc.attend_activity_list.unshift({
          name_ar: obj.activity.name_ar,
          name_en: obj.activity.name_en,
          trainer_attend: obj.trainer,
          attend_date: obj.attend_date,
          attend_time: obj.attend_time,
          leave_date: obj.leave_date,
          leave_time: obj.leave_time,
        })

        if (!err && doc) $request_activity.edit(doc)
      }
    })

  })

  site.on('[account_invoices][request_activity][+]', function (objId) {
    $request_activity.findOne({ id: objId }, (err, doc) => {
      if (doc) {
        doc.invoice = true
        doc.invoice_id = objId
        $request_activity.update(doc);
      }
    });
  });


  site.post({
    name: "/api/period_class/all",
    path: __dirname + "/site_files/json/period_class.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "request_activity",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/request_activity/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let request_activity_doc = req.body
    request_activity_doc.$req = req
    request_activity_doc.$res = res

    request_activity_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof request_activity_doc.active === 'undefined') {
      request_activity_doc.active = true
    }

    request_activity_doc.company = site.get_company(req)
    request_activity_doc.branch = site.get_branch(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'request_activity',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!request_activity_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      request_activity_doc.code = cb.code;
    }


    $request_activity.add(request_activity_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/request_activity/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let request_activity_doc = req.body

    request_activity_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (request_activity_doc.id) {
      $request_activity.edit({
        where: {
          id: request_activity_doc.id
        },
        set: request_activity_doc,
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

  site.post("/api/request_activity/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $request_activity.findOne({
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

  site.post("/api/request_activity/delete", (req, res) => {
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
      $request_activity.delete({
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

  site.post("/api/request_activity/all", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}
    let search = req.body.search

    if (search) {
      where.$or.push({
        'activity.name_ar': site.get_RegExp(search, "i")
      }, {
        'activity.name_en': site.get_RegExp(search, "i")
      }, {
        'customer.name_ar': site.get_RegExp(search, "i")
      }, {
        'customer.name_en': site.get_RegExp(search, "i")
      }, {
        'trainer.name_ar': site.get_RegExp(search, "i")
      }, {
        'trainer.name_en': site.get_RegExp(search, "i")
      }, {
        'hall.name_ar': site.get_RegExp(search, "i")
      }, {
        'hall.name_en': site.get_RegExp(search, "i")
      })

    }

    if (where['shift_code']) {
      where['shift.code'] = site.get_RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }

    if (where.date_from_to && where.date_from_from) {
      let d1 = site.toDate(where.date_from_from)
      let d2 = site.toDate(where.date_from_to)
      d2.setDate(d2.getDate() + 1);
      where.date_from = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from_from
      delete where.date_from_to
    }

    if (where.date_to_to && where.date_to_from) {
      let d1 = site.toDate(where.date_to_from)
      let d2 = site.toDate(where.date_to_to)
      d2.setDate(d2.getDate() + 1);
      where.date_to = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_to_from
      delete where.date_to_to
    }

    if (where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_from)
      d2.setDate(d2.getDate() + 1)
      where.date_from = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where.date_to) {
      let d1 = site.toDate(where.date_to)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1)
      where.date_to = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where['hall']) {
      where['hall.id'] = where['hall'].id;
      delete where['hall']
    }


    if (where['activity_name']) {
      where.$or.push({
        'activity_name_ar': site.get_RegExp(where['activity_name'], 'i'),
        'activity_name_en': site.get_RegExp(where['activity_name'], 'i')
      })
    }

    if (where['customer']) {
      where.$or.push({
        'customer.name_ar': site.get_RegExp(where['customer'], 'i'),
        'customer.name_en': site.get_RegExp(where['customer'], 'i')
      })
    }

    if (where['trainer']) {
      where.$or.push({
        'trainer.name_ar': site.get_RegExp(where['trainer'], 'i'),
        'trainer.name_en': site.get_RegExp(where['trainer'], 'i')
      })
    }

    if (where['code']) where['code'] = site.get_RegExp(where['code'], "i");

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    $request_activity.findMany({
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

  site.post("/api/request_activity/all_session", (req, res) => {

    let response = {
      done: false
    }

    let where = req.body.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []

      where.$or.push({
        'customer.id': search.id
      })

      where['company.id'] = site.get_company(req).id
      where['branch.code'] = site.get_branch(req).code

      $request_activity.findMany({
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1
        },
        limit: req.body.limit
      }, (err, docs, count) => {
        if (!err) {
          let activities_list = []
          docs.forEach(request_activity => {
            if (request_activity.complex_activities_list && request_activity.complex_activities_list.length > 0) {
              request_activity.complex_activities_list.forEach(selectedActivities => {
                if (selectedActivities.remain) {
                  activities_list.push({
                    id: request_activity.id,
                    name_ar: selectedActivities.name_ar,
                    name_en: selectedActivities.name_en,
                    general_activity_ar: request_activity.activity_name_ar,
                    general_activity_en: request_activity.activity_name_en,
                    activity_id: selectedActivities.id
                  })
                }
              });
            } else {
              if (request_activity.remain) {
                activities_list.push({
                  id: request_activity.id,
                  name_ar: request_activity.activity_name_ar,
                  name_en: request_activity.activity_name_en,
                  activity_id: request_activity.activity_id
                })
              }
            }

          });

          response.done = true
          response.list = activities_list
          response.count = count
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    }
  })

  site.getDataToDelete = function (data, callback) {
    let where = {}

    if (data.name == 'hall') where['hall.id'] = data.id
    else if (data.name == 'customer') where['customer.id'] = data.id
    else if (data.name == 'trainer') where['trainer.id'] = data.id
    else if (data.name == 'activity') where['activity_id'] = data.id

    $request_activity.findOne({
      where: where,
    }, (err, docs, count) => {
      if (!err) {
        if (docs) callback(true)
        else callback(false)
      }
    })
  }

}