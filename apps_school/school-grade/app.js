module.exports = function init(site) {
  const $school_grade = site.connectCollection("school_grade")

  $school_grade.deleteDuplicate({
    code: 1,
    'company.id': 1
  }, (err, result) => {
    $school_grade.createUnique({
      code: 1,
      'company.id': 1
    }, (err, result) => { })
  })

  site.get({
    name: "school_grade",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.on('[company][created]', doc => {

    $school_grade.add({
      name: "مرحلة دراسية إفتراضية",
      code : "1",
      image_url: '/images/school_grade.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc) => {
    })
  })



  site.post("/api/school_grade/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let school_grade_doc = req.body
    school_grade_doc.$req = req
    school_grade_doc.$res = res
    school_grade_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    let num_obj = {
      company: site.get_company(req),
      screen: 'school_grade',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!school_grade_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      school_grade_doc.code = cb.code;
    }

    school_grade_doc.company = site.get_company(req)
    school_grade_doc.branch = site.get_branch(req)

    $school_grade.add(school_grade_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/school_grade/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let school_grade_doc = req.body
    school_grade_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (school_grade_doc.id) {
      $school_grade.edit({
        where: {
          id: school_grade_doc.id
        },
        set: school_grade_doc,
        $req: req,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
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

  site.post("/api/school_grade/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $school_grade.findOne({
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

  site.post("/api/school_grade/delete", (req, res) => {
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
      $school_grade.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
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

  site.post("/api/school_grade/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id

    $school_grade.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
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