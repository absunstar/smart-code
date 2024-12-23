module.exports = function init(site) {
  const $attend_session = site.connectCollection("attend_session")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "attend_session",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/attend_session/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let attend_session_doc = req.body
    attend_session_doc.$req = req
    attend_session_doc.$res = res

    attend_session_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    attend_session_doc.company = site.get_company(req)
    attend_session_doc.branch = site.get_branch(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'attend_session',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!attend_session_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      attend_session_doc.code = cb.code;
    }

    $attend_session.add(attend_session_doc, (err, doc) => {
      if (!err && doc) {

        response.done = true
        let obj = {
          busy: true,
          trainerId: doc.trainer.id,
          customerId: doc.customer.id
        }
        site.call('[attend_session][busy][+]', obj)

        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/attend_session/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let attend_session_doc = req.body

    attend_session_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (attend_session_doc.id) {
      $attend_session.edit({
        where: {
          id: attend_session_doc.id
        },
        set: attend_session_doc,
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

  site.post("/api/attend_session/update_leave", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let attend_session_doc = req.body

    attend_session_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (attend_session_doc.id) {
      $attend_session.edit({
        where: {
          id: attend_session_doc.id
        },
        set: attend_session_doc,
        $req: req,
        $res: res
      }, (err, attend_doc) => {
        if (!err && attend_doc) {

          let busy_obj = {
            busy: false,
            trainerId: attend_doc.doc.trainer.id,
            customerId: attend_doc.doc.customer.id
          }

          let activity_obj = {
            activity: attend_doc.doc.activity,
            trainer: attend_doc.doc.trainer,
            attend_date: attend_doc.doc.attend_date,
            attend_time: attend_doc.doc.attend_time,
            leave_date: attend_doc.doc.leave_date,
            leave_time: attend_doc.doc.leave_time,
          }

          site.call('[attend_session][busy][+]', busy_obj)
          site.call('[attend_session][attend_request][+]', activity_obj)
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

  site.post("/api/attend_session/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $attend_session.findOne({
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

  site.post("/api/attend_session/delete", (req, res) => {
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
      $attend_session.delete({
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

  site.post("/api/attend_session/all", (req, res) => {

    let response = {
      done: false
    }
              
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }



    let where = req.body.where || {}

    if (where['name_Ar']) {
      where['customer.name_Ar'] = site.get_RegExp(where['name_Ar'], "i");
    }

    if (where.attend_date_to && where.attend_date_from) {
      let d1 = site.toDate(where.attend_date_from)
      let d2 = site.toDate(where.attend_date_to)
      d2.setDate(d2.getDate() + 1);
      where.attend_date = {
        '$gte': d1,
        '$lt': d2
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
        '$lt': d2
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
        '$lt': d2
      }
    }

    if (where.leave_date) {
      let d1 = site.toDate(where.leave_date)
      let d2 = site.toDate(where.leave_date)
      d2.setDate(d2.getDate() + 1)
      where.leave_date = {
        '$gte': d1,
        '$lt': d2
      }
    }


    if (where.search && where.search.current) {

      where['current'] = where.search.current
    }
    delete where.search

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $attend_session.findMany({
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