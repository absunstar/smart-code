module.exports = function init(site) {
  const $second_subsections = site.connectCollection("second_subsections")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "second_subsections",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $second_subsections.add({
      code: "1-Test",
      name_ar: "قسم رئيسي إفتراضي",
      name_en: "Default main section",
      image_url: '/images/second_subsections.png',
    
      active: true
    }, (err, doc) => {
      site.call('[register][tables][add]', doc)

    })
  })

  site.post("/api/second_subsections/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let second_subsections_doc = req.body
    second_subsections_doc.$req = req
    second_subsections_doc.$res = res

    second_subsections_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof second_subsections_doc.active === 'undefined') {
      second_subsections_doc.active = true
    }

    let num_obj = {
      screen: 'second_subsections',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!second_subsections_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      second_subsections_doc.code = cb.code;
    }

    $second_subsections.find({
      where: {
        $or: [{
          'name_ar': second_subsections_doc.name_ar
        },{
          'name_en': second_subsections_doc.name_en
        }]
    
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $second_subsections.add(second_subsections_doc, (err, doc) => {
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

  site.post("/api/second_subsections/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let second_subsections_doc = req.body

    second_subsections_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (second_subsections_doc.id) {
      $second_subsections.edit({
        where: {
          id: second_subsections_doc.id
        },
        set: second_subsections_doc,
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

  site.post("/api/second_subsections/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $second_subsections.findOne({
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

  site.post("/api/second_subsections/delete", (req, res) => {
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
      $second_subsections.delete({
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

  site.post("/api/second_subsections/all", (req, res) => {
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

    $second_subsections.findMany({
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