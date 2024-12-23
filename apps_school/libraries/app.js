module.exports = function init(site) {
  const $libraries = site.connectCollection("libraries")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "libraries",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $libraries.add({
      name_Ar: "مكتبة إفتراضية",
      name_En: "Default Libraries",
      code: "1-Test",
      image_url: '/images/libraries.png',
      links_list: [{}],
      files_list: [{}],
      images_list: [{}],
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
      active: true
    }, (err, doc) => { })
  })


  site.post("/api/libraries/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let libraries_doc = req.body
    libraries_doc.$req = req
    libraries_doc.$res = res

    libraries_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof libraries_doc.active === 'undefined') {
      libraries_doc.active = true
    }

    libraries_doc.company = site.get_company(req)
    libraries_doc.branch = site.get_branch(req)

    $libraries.find({

      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        $or: [{
          'name_Ar': libraries_doc.name_Ar
        }, {
          'name_En': libraries_doc.name_En
        }]

      }
    }, (err, doc) => {
      if (!err && doc) {

        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'libraries',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!libraries_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          libraries_doc.code = cb.code;
        }

        $libraries.add(libraries_doc, (err, doc) => {
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

  site.post("/api/libraries/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let libraries_doc = req.body

    libraries_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (libraries_doc.id) {
      $libraries.edit({
        where: {
          id: libraries_doc.id
        },
        set: libraries_doc,
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

  site.post("/api/libraries/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $libraries.findOne({
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

  site.post("/api/libraries/delete", (req, res) => {
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
      $libraries.delete({
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


  site.post("/api/libraries/all", (req, res) => {
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
      where['name_Ar'] = site.get_RegExp(where['name_Ar'], "i");
    }

    if (where['name_En']) {
      where['name_En'] = site.get_RegExp(where['name_En'], "i");
    }

    where['company.id'] = site.get_company(req).id
    // where['branch.code'] = site.get_branch(req).code

    if (req.session.user.type == 'customer') {
      if (req.session.user.school_grade_id)
        where['school_grade.id'] = req.session.user.school_grade_id;

      if (req.session.user.students_year_id)
        where['students_year.id'] = req.session.user.students_year_id;
    }

    $libraries.findMany({
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