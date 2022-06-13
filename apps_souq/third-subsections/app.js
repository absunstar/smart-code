module.exports = function init(site) {
  const $third_subsections = site.connectCollection("third_subsections")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "third_subsections",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $third_subsections.add({
      code: "1-Test",
      name_ar: "قسم رئيسي إفتراضي",
      name_en: "Default main section",
      image_url: '/images/third_subsections.png',
    
      active: true
    }, (err, doc) => {
      site.call('[register][tables][add]', doc)

    })
  })

  site.post("/api/third_subsections/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let third_subsections_doc = req.body
    third_subsections_doc.$req = req
    third_subsections_doc.$res = res

    third_subsections_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof third_subsections_doc.active === 'undefined') {
      third_subsections_doc.active = true
    }

    let num_obj = {
      screen: 'third_subsections',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!third_subsections_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      third_subsections_doc.code = cb.code;
    }

    $third_subsections.find({
      where: {
        $or: [{
          'name_ar': third_subsections_doc.name_ar
        },{
          'name_en': third_subsections_doc.name_en
        }]
    
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $third_subsections.add(third_subsections_doc, (err, doc) => {
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

  site.post("/api/third_subsections/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let third_subsections_doc = req.body

    third_subsections_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (third_subsections_doc.id) {
      $third_subsections.edit({
        where: {
          id: third_subsections_doc.id
        },
        set: third_subsections_doc,
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

  site.post("/api/third_subsections/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $third_subsections.findOne({
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

  site.post("/api/third_subsections/delete", (req, res) => {
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
      $third_subsections.delete({
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

  site.post("/api/third_subsections/all", (req, res) => {
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

    $third_subsections.findMany({
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