module.exports = function init(site) {
  const $sub_categories_3 = site.connectCollection("sub_categories_3")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "sub_categories_3",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $sub_categories_3.add({
      code: "3-Test",
      name_ar: "قسم فرعي 3 إفتراضي",
      name_en: "Default Sub Categories 3",
      image_url: '/images/sub_categories_3.png',
    
      active: true
    }, (err, doc) => {

    })
  })

  site.post("/api/sub_categories_3/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let sub_categories_3_doc = req.body
    sub_categories_3_doc.$req = req
    sub_categories_3_doc.$res = res

    sub_categories_3_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof sub_categories_3_doc.active === 'undefined') {
      sub_categories_3_doc.active = true
    }

    let num_obj = {
      screen: 'sub_categories_3',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!sub_categories_3_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      sub_categories_3_doc.code = cb.code;
    }

    $sub_categories_3.find({
      where: {
        $or: [{
          'name_ar': sub_categories_3_doc.name_ar
        },{
          'name_en': sub_categories_3_doc.name_en
        }]
    
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $sub_categories_3.add(sub_categories_3_doc, (err, doc) => {
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

  site.post("/api/sub_categories_3/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let sub_categories_3_doc = req.body

    sub_categories_3_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (sub_categories_3_doc.id) {
      $sub_categories_3.edit({
        where: {
          id: sub_categories_3_doc.id
        },
        set: sub_categories_3_doc,
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

  site.post("/api/sub_categories_3/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $sub_categories_3.findOne({
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

  site.post("/api/sub_categories_3/delete", (req, res) => {
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
      $sub_categories_3.delete({
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

  site.post("/api/sub_categories_3/all", (req, res) => {
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

 
    delete where.search

    $sub_categories_3.findMany({
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