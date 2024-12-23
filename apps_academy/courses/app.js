module.exports = function init(site) {
  const $courses = site.connectCollection("courses")

  site.post({
    name: "/api/period/all",
    path: __dirname + "/site_files/json/period.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "courses",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.on('[company][created]', (doc) => {
    $courses.add(
      {
        code: "1-Test",
        name_Ar: 'كورس إفتراضي',
        name_En: "Default Course",
        image_url: '/images/courses.png',
        price: 1,
        courses_total: 1,
        period: {
          id: 1,
          name: "1",
          En: "Day",
          Ar: "يوم"
        },
        number_lecture: 1,
        company: {
          id: doc.id,
          name_Ar: doc.name_Ar,
          name_En: doc.name_En
        },
        branch: {
          code: doc.branch_list[0].code,
          name_Ar: doc.branch_list[0].name_Ar,
          name_En: doc.branch_list[0].name_En
        },
        active: true,
      },
      (err, doc1) => {
      },
    );
  });

  site.post("/api/courses/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let courses_doc = req.body
    courses_doc.$req = req
    courses_doc.$res = res

    courses_doc.company = site.get_company(req)
    courses_doc.branch = site.get_branch(req)

    courses_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof courses_doc.active === 'undefined') {
      courses_doc.active = true
    }

    $courses.find({
      where: {

        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        $or: [{
          'name_Ar': courses_doc.name_Ar
        }, {
          'name_En': courses_doc.name_En
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'courses',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!courses_doc.code && !cb.auto) {

          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          courses_doc.code = cb.code;
        }

        $courses.add(courses_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc

          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })
  })

  site.post("/api/courses/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let courses_doc = req.body

    courses_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (courses_doc.id) {
      $courses.edit({
        where: {
          id: courses_doc.id
        },
        set: courses_doc,
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

  site.post("/api/courses/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $courses.findOne({
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

  site.post("/api/courses/delete", (req, res) => {
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
      $courses.delete({
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

  site.post("/api/courses/all", (req, res) => {
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

    if (where.search && where.search.courses_total) {

      where['courses_total'] = where.search.courses_total
    }
    if (where.search && where.search.price) {

      where['price'] = where.search.price
    }

    delete where.search

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $courses.findMany({
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