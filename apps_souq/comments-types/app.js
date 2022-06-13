module.exports = function init(site) {
  const $comments_types = site.connectCollection("comments_types")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "comments_types",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $comments_types.add({
      code: "1-Test",
      name_ar: "نوع تعليق إفتراضي",
      name_en: "Default Comments Type",
      image_url: '/images/comments_types.png',
    
      active: true
    }, (err, doc) => {
      site.call('[register][tables][add]', doc)

    })
  })

  site.post("/api/comments_types/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let comments_types_doc = req.body
    comments_types_doc.$req = req
    comments_types_doc.$res = res

    comments_types_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof comments_types_doc.active === 'undefined') {
      comments_types_doc.active = true
    }

    let num_obj = {
      screen: 'comments_types',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!comments_types_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      comments_types_doc.code = cb.code;
    }

    $comments_types.find({
      where: {
        $or: [{
          'name_ar': comments_types_doc.name_ar
        },{
          'name_en': comments_types_doc.name_en
        }]
    
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $comments_types.add(comments_types_doc, (err, doc) => {
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

  site.post("/api/comments_types/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let comments_types_doc = req.body

    comments_types_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (comments_types_doc.id) {
      $comments_types.edit({
        where: {
          id: comments_types_doc.id
        },
        set: comments_types_doc,
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

  site.post("/api/comments_types/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $comments_types.findOne({
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

  site.post("/api/comments_types/delete", (req, res) => {
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
      $comments_types.delete({
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

  site.post("/api/comments_types/all", (req, res) => {
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

    $comments_types.findMany({
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