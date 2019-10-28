module.exports = function init(site) {
  const $attend_session = site.connectCollection("attend_session")

  /* site.on('[company][created]', doc => {

    $attend_session.add({
      code: "1",
      name: "قاعة إفتراضية",
      image_url: '/images/attend_session.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc) => { })
  }) */



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

    if (typeof attend_session_doc.active === 'undefined') {
      attend_session_doc.active = true
    }

    attend_session_doc.company = site.get_company(req)
    attend_session_doc.branch = site.get_branch(req)

    $attend_session.add(attend_session_doc, (err, doc) => {
      if (!err) {
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
      }, (err, doc) => {
        if (!err && doc) {
          response.done = true
          let obj = {
            
          }
          site.call('[attend_session][store_in][+]', obj)

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

    let where = req.body.where || {}

    if (where['name_ar']) {
      where['customer.name_ar'] = new RegExp(where['name_ar'], "i");
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