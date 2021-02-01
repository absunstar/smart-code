module.exports = function init(site) {
  const $scan_centers = site.connectCollection("scan_centers")

  site.on('[register][scan_center][add]', (doc, callback) => {
    doc.active = true
    doc.scan_list = [{ active: true }]
    $scan_centers.add(doc, (err, doc) => {
      callback(err, doc)
    })
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.get({
    name: "scan_centers",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[register][scan_centers][add]', doc => {

    $scan_centers.add({
      code: "1-Test",
      name: "معمل أشعة إفتراضي",
      image_url: '/images/scan_center.png',
      scan_list: [{
        scan: {

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


  site.post("/api/scan_centers/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let scan_centers_doc = req.body
    scan_centers_doc.$req = req
    scan_centers_doc.$res = res

    scan_centers_doc.company = site.get_company(req);
    scan_centers_doc.branch = site.get_branch(req);


    scan_centers_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof scan_centers_doc.active === 'undefined') {
      scan_centers_doc.active = true
    }

    let num_obj = {
      company: site.get_company(req),
      screen: 'scan_centers',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!scan_centers_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      scan_centers_doc.code = cb.code;
    }

    $scan_centers.find({

      'company.id': site.get_company(req).id,
      'branch.code': site.get_branch(req).code,
      where: {
        $or: [{
          'name': scan_centers_doc.name
        }, {
          'phone': scan_centers_doc.phone
        }, {
          'mobile': scan_centers_doc.mobile
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name , Phone Or mobile Exists'
        res.json(response)
      } else {

        user = {
          name: scan_centers_doc.name,
          mobile: scan_centers_doc.mobile,
          username: scan_centers_doc.username,
          email: scan_centers_doc.username,
          password: scan_centers_doc.password,
          image_url: scan_centers_doc.image_url,
          type: 'scan_center'
        }

        user.roles = [{
          name: 'scan_centers_admin'
        }]

        user.profile = {
          name: user.name,
          mobile: user.mobile,
          image_url: user.image_url
        }


        $scan_centers.add(scan_centers_doc, (err, doc) => {
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
                  $scan_centers.edit(doc, (err1, doc1) => {
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

  site.post("/api/scan_centers/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let scan_centers_doc = req.body

    user = {
      name: scan_centers_doc.name,
      mobile: scan_centers_doc.mobile,
      username: scan_centers_doc.username,
      email: scan_centers_doc.username,
      password: scan_centers_doc.password,
      image_url: scan_centers_doc.image_url,
      type: 'scan_center'
    }

    user.roles = [{
      name: 'scan_centers_admin'
    }]

    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url
    }

    user.ref_info = {
      id: scan_centers_doc.id
    }

    scan_centers_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (scan_centers_doc.id) {
      $scan_centers.edit({
        where: {
          id: scan_centers_doc.id
        },
        set: scan_centers_doc,
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
                $scan_centers.edit(doc.doc, (err2, doc2) => {
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

  site.post("/api/scan_centers/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $scan_centers.findOne({
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

  site.post("/api/scan_centers/delete", (req, res) => {
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
      $scan_centers.delete({
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

  site.post("/api/scan_centers/all", (req, res) => {
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

    if (req.session.user && req.session.user.type === 'scan_center') {
      where['id'] = req.session.user.ref_info.id;
    }

    $scan_centers.findMany({
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