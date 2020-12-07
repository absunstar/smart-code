module.exports = function init(site) {
  const $subjects = site.connectCollection("subjects")
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "subjects",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $subjects.add({
      name: "مادة دراسية إفتراضية",
      image_url: '/images/circle.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc) => {})
  })


  site.post("/api/subjects/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let subjects_doc = req.body
    subjects_doc.$req = req
    subjects_doc.$res = res

    subjects_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof subjects_doc.active === 'undefined') {
      subjects_doc.active = true
    }

    subjects_doc.company = site.get_company(req)
    subjects_doc.branch = site.get_branch(req)

    $subjects.find({

      where: {
        
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        'name': subjects_doc.name
      }
    }, (err, doc) => {
      if (!err && doc) {
        
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'subjects',
          date: new Date()
        };
    
        let cb = site.getNumbering(num_obj);
        if (!subjects_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;
    
        } else if (cb.auto) {
          subjects_doc.code = cb.code;
        }

        $subjects.add(subjects_doc, (err, doc) => {
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

  site.post("/api/subjects/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let subjects_doc = req.body

    subjects_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (subjects_doc.id) {
      $subjects.edit({
        where: {
          id: subjects_doc.id
        },
        set: subjects_doc,
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

  site.post("/api/subjects/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $subjects.findOne({
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

  site.post("/api/subjects/delete", (req, res) => {
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
      $subjects.delete({
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


  site.post("/api/subjects/all", (req, res) => {
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

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $subjects.findMany({
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