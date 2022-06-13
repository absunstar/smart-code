module.exports = function init(site) {
  const $main_sections = site.connectCollection("main_sections")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "main_sections",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $main_sections.add({
      code: "1-Test",
      name_ar: "قسم رئيسي إفتراضي",
      name_en: "Default main section",
      image_url: '/images/main_sections.png',
    
      active: true
    }, (err, doc) => {
      site.call('[register][tables][add]', doc)

    })
  })

  site.post("/api/main_sections/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let main_sections_doc = req.body
    main_sections_doc.$req = req
    main_sections_doc.$res = res

    main_sections_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof main_sections_doc.active === 'undefined') {
      main_sections_doc.active = true
    }

    let num_obj = {
      screen: 'main_sections',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!main_sections_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      main_sections_doc.code = cb.code;
    }

    $main_sections.find({
      where: {
        $or: [{
          'name_ar': main_sections_doc.name_ar
        },{
          'name_en': main_sections_doc.name_en
        }]
    
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $main_sections.add(main_sections_doc, (err, doc) => {
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

  site.post("/api/main_sections/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let main_sections_doc = req.body

    main_sections_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (main_sections_doc.id) {
      $main_sections.edit({
        where: {
          id: main_sections_doc.id
        },
        set: main_sections_doc,
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

  site.post("/api/main_sections/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $main_sections.findOne({
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

  site.post("/api/main_sections/delete", (req, res) => {
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
      $main_sections.delete({
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

  site.post("/api/main_sections/all", (req, res) => {
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

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], "i");
    }

    if (where.search && where.search.salary) {

      where['salary'] = where.search.salary
    }

    delete where.search

    $main_sections.findMany({
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