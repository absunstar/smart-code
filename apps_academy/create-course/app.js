module.exports = function init(site) {
  const $create_course = site.connectCollection("create_course")

  site.on('[book_course][create_course][+]', function (obj) {

    $create_course.find({
      'id': obj.select_book.id
    }, (err, doc) => {
      if (!err && doc) {

        doc.dates_list.forEach(d => {
          d.student_list = d.student_list || []
          d.student_list.push(obj.customer)
        })

        $create_course.update(doc, (err, result) => { })
      }
    })
  })

  site.post({
    name: "/api/period_create/all",
    path: __dirname + "/site_files/json/period_create.json"

  })

  site.post({
    name: "/api/attend_create/all",
    path: __dirname + "/site_files/json/attend_create.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "create_course",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post({
    name: "/api/times_create/all",
    path: __dirname + "/site_files/json/times_create.json"

  })

  site.post("/api/create_course/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let create_course_doc = req.body
    create_course_doc.$req = req
    create_course_doc.$res = res

    create_course_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof create_course_doc.active === 'undefined') {
      create_course_doc.active = true
    }

    create_course_doc.company = site.get_company(req)
    create_course_doc.branch = site.get_branch(req)

    $create_course.add(create_course_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
        if (doc.course) {
          let course = {
            create_course_id: doc.id,
            course: doc.course,
            shift: doc.shift,
            date_from: doc.date_from,
            date_to: doc.date_to,
            number_lecture: doc.number_lecture,
            dates_list: doc.dates_list,
            image_url: doc.image_url,
            company: doc.company,
            branch: doc.branch
          }
          site.call('[create_course][account_course][add]', course)
        }
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/create_course/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let create_course_doc = req.body

    create_course_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (create_course_doc.id) {
      $create_course.edit({
        where: {
          id: create_course_doc.id
        },
        set: create_course_doc,
        $req: req,
        $res: res
      }, (err, result) => {

        if (!err && result) {
          response.done = true
          response.doc = result.doc
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


  site.post("/api/create_course/edit_trainer", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let create_course_doc = req.body

    create_course_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (create_course_doc.id) {
      $create_course.edit({
        where: {
          id: create_course_doc.id
        },
        set: create_course_doc,
        $req: req,
        $res: res
      }, (err, result) => {

        if (!err && result) {
          response.done = true
          response.doc = result.doc
          let course = {
            id: response.doc.id,
            trainer: response.doc.trainer,
            dates_list: response.doc.dates_list,
            company: response.doc.company,
            branch: response.doc.branch
          }
          site.call('[create_course][account_course][edit_trainer]', course)
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


  site.post("/api/create_course/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $create_course.findOne({
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

  site.post("/api/create_course/delete", (req, res) => {
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
      $create_course.delete({
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

  site.post("/api/create_course/all", (req, res) => {
    let response = {
      done: false
    }
          
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], "i");
    }

    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], "i");
    }

    if (where.search && where.search.price) {

      where['course.price'] = where.search.price
    }

    delete where.search

    if (where['course']) {
      where['course.id'] = where['course'].id;
      delete where['course']
      delete where.active
    }

    if (where['trainer']) {
      where['trainer.id'] = where['trainer'].id;
      delete where['trainer']
      delete where.active
    }

    if (where['hall']) {
      where['hall.id'] = where['hall'].id;
      delete where['hall']
      delete where.active
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $create_course.findMany({
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