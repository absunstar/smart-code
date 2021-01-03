module.exports = function init(site) {
  const $account_course = site.connectCollection("account_course")

  site.on('[create_course][account_course][add]', doc => {

    $account_course.add({
      active: true,
      create_course_id: doc.create_course_id,
      course: {
        id: doc.course.id,
        name: doc.course.name
      },
      image_url: '/images/account_course.png',
      period: doc.course.period,
      shift: doc.shift,
      courses_total: doc.course.courses_total,
      number_lecture: doc.dates_list.length,
      price: doc.course.price,
      date_from: doc.date_from,
      date_to: doc.date_to,
      dates_list: doc.dates_list,
      total_rest: 0,
      rest: 0,
      company: doc.company,
      branch: doc.branch
    })
  })

  site.on('[create_course][account_course][edit_trainer]', function (obj) {

    $account_course.find({
      'create_course_id': obj.id
    }, (err, doc) => {
      if (!err && doc) {
        doc.trainer = obj.trainer
        doc.dates_list = obj.dates_list
        doc.trainer_account = 0
        
        obj.dates_list.forEach(d => {
          doc.trainer_account += d.account_lectures

        });
        $account_course.update(doc, (err, result) => { })

      }
    })
  })

  site.post({
    name: "/api/attend/all",
    path: __dirname + "/site_files/json/attend.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "account_course",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/account_course/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let account_course_doc = req.body
    account_course_doc.$req = req
    account_course_doc.$res = res

    account_course_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof account_course_doc.active === 'undefined') {
      account_course_doc.active = true
    }

    account_course_doc.company = site.get_company(req)
    account_course_doc.branch = site.get_branch(req)

    $account_course.add(account_course_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/account_course/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let account_course_doc = req.body

    account_course_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (account_course_doc.id) {
      $account_course.edit({
        where: {
          id: account_course_doc.id
        },
        set: account_course_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err && result) {
          response.done = true
          response.doc = result.doc
          if (response.doc.safe) {

            let paid_value = {
              value: response.doc.baid_go,
              sourceName: response.doc.trainer_paid.name,
              company: response.doc.company,
              branch: response.doc.branch,
              date: response.doc.date_paid,
              shift: {
                id: result.doc.shift.id,
                code: result.doc.shift.code,
                name: result.doc.shift.name
              },
              transition_type: 'out',
              operation: 'دفعة حساب مدرب',
              safe: response.doc.safe
            }
            site.quee('[amounts][safes][+]', paid_value)
          }

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

  site.post("/api/account_course/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $account_course.findOne({
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

  site.post("/api/account_course/delete", (req, res) => {
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
      $account_course.delete({
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

  site.post("/api/account_course/all", (req, res) => {
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
      where['name'] = site.get_RegExp(where['name'], "i");
    }
    if (where['trainer']) {
      where['trainer.id'] = where['trainer'].id;
      delete where['trainer']
      delete where.active
    }
    if (where.search && where.search.courses_total) {

      where['courses_total'] = where.search.courses_total
    }

    delete where.search

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $account_course.findMany({
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