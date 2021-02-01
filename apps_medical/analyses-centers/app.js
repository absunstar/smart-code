module.exports = function init(site) {
  const $analyses_centers = site.connectCollection("analyses_centers")

  site.on('[register][analyses_center][add]', (doc, callback) => {
    doc.active = true
    doc.analyses_list = [{
      active: true
    }]
    $analyses_centers.add(doc, (err, doc) => {
      callback(err, doc)
    })
  })

  site.on('[register][analyses_centers][add]', doc => {

    $analyses_centers.add({
      code: "1-Test",
      name: "معمل تحاليل إفتراضي",
      image_url: '/images/analyses_center.png',
      analyses_list: [{
        analyses: {

          id: doc.id,
          code: doc.code,
          name: doc.name,
          price: doc.price,
          immediate: doc.immediate,
        },
        active: true
      }],
      company: {
        id: doc.company.id,
        name_ar: doc.company.name_ar
      },
      branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar
      },
      active: true
    }, (err, doc1) => {

    })
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.get({
    name: "analyses_centers",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.post("/api/analyses_centers/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let analyses_centers_doc = req.body
    analyses_centers_doc.$req = req
    analyses_centers_doc.$res = res

    analyses_centers_doc.company = site.get_company(req);
    analyses_centers_doc.branch = site.get_branch(req);

    analyses_centers_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof analyses_centers_doc.active === 'undefined') {
      analyses_centers_doc.active = true
    }


    let num_obj = {
      company: site.get_company(req),
      screen: 'analyses_centers',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!analyses_centers_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      analyses_centers_doc.code = cb.code;
    }


    $analyses_centers.find({
      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        $or: [{
          'name': analyses_centers_doc.name
        }, {
          'phone': analyses_centers_doc.phone
        }, {
          'mobile': analyses_centers_doc.mobile
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name , Phone Or mobile Exists'
        res.json(response)
      } else {
        user = {
          name: analyses_centers_doc.name,
          mobile: analyses_centers_doc.mobile,
          username: analyses_centers_doc.username,
          email: analyses_centers_doc.username,
          password: analyses_centers_doc.password,
          image_url: analyses_centers_doc.image_url,
          type: 'analyses_center'
        }

        user.roles = [{
          name: 'analyses_centers_admin'
        }]

        user.profile = {
          name: user.name,
          mobile: user.mobile,
          image_url: user.image_url
        }

        $analyses_centers.add(analyses_centers_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc
            user.ref_info = {
              id: doc.id
            }

            if (user.password && user.username) {

              site.security.addUser(user, (err, doc1) => {
                if (!err) {
                  delete user._id
                  delete user.id
                  doc.user_info = {
                    id: doc1.id
                  }

                  $analyses_centers.edit(doc, (err2, doc2) => {
                    res.json(response)
                  })

                } else {
                  response.error = err.message
                }
                res.json(response)
              })
            }
          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })
  })

  site.post("/api/analyses_centers/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let analyses_centers_doc = req.body

    user = {
      name: analyses_centers_doc.name,
      mobile: analyses_centers_doc.mobile,
      username: analyses_centers_doc.username,
      email: analyses_centers_doc.username,
      password: analyses_centers_doc.password,
      image_url: analyses_centers_doc.image_url,
      type: 'analyses_center'
    }

    user.roles = [{
      name: 'analyses_centers_admin'
    }]
    user.ref_info = {
      id: analyses_centers_doc.id
    }
    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url
    }

    analyses_centers_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (analyses_centers_doc.id) {
      $analyses_centers.edit({
        where: {
          id: analyses_centers_doc.id
        },
        set: analyses_centers_doc,
        $req: req,
        $res: res
      }, (err, doc) => {
        if (!err) {
          response.done = true
          if (user.password && user.username) {

            site.security.addUser(user, (err, doc1) => {
              if (!err) {
                delete user._id
                delete user.id
                doc.doc.user_info = {
                  id: doc1.id
                }

                $analyses_centers.edit(doc.doc, (err2, doc2) => {
                  res.json(response)
                })

              } else {
                response.error = err.message
              }
              res.json(response)
            })
          }
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

  site.post("/api/analyses_centers/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $analyses_centers.findOne({
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

  site.post("/api/analyses_centers/delete", (req, res) => {
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
      $analyses_centers.delete({
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

  site.post("/api/analyses_centers/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}
    if (where['gov']) {
      where['gov.id'] = where['gov'].id;
      delete where['gov']
      delete where.active
    }

    if (where['city']) {
      where['city.id'] = where['city'].id;
      delete where['city']
      delete where.active
    }

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }
    if (where['address']) {
      where['address'] = new RegExp(where['address'], "i");
    }
    if (where['hotline']) {
      where['hotline'] = new RegExp(where['hotline'], "i");
    }
    if (where['phone']) {
      where['phone'] = new RegExp(where['phone'], "i");
    }
    if (where['mobile']) {
      where['mobile'] = new RegExp(where['mobile'], "i");
    }
    if (where['fax']) {
      where['fax'] = new RegExp(where['fax'], "i");
    }
    if (where['facebook']) {
      where['facebook'] = new RegExp(where['facebook'], "i");
    }
    if (where['twitter']) {
      where['twitter'] = new RegExp(where['twitter'], "i");
    }
    if (where['email']) {
      where['email'] = new RegExp(where['email'], "i");
    }
    if (where['website']) {
      where['website'] = new RegExp(where['website'], "i");
    }
    if (where['whatsapp']) {
      where['whatsapp'] = new RegExp(where['whatsapp'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (req.session.user && req.session.user.type === 'analyses_center') {
      where['id'] = req.session.user.ref_info.id;
    }

    $analyses_centers.findMany({
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