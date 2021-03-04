module.exports = function init(site) {
  const $vehicles = site.connectCollection("vehicles")
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "vehicles",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {
    if (site.feature('pos') || site.feature('erp') || site.feature('restaurant') || site.feature('school')) {

      $vehicles.add({
        name_ar: "مركبة/سيارة إفتراضية",
        name_en: "Default Vehicle/Car",
        image_url: '/images/vehicles.png',
        code: "1-Test",
        company: {
          id: doc.id,
          name_ar: doc.name_ar,
          name_en: doc.name_en
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar,
          name_en: doc.branch_list[0].name_en
        },
        active: true
      }, (err, doc) => { })
    }

  })


  site.post("/api/vehicles/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let vehicles_doc = req.body
    vehicles_doc.$req = req
    vehicles_doc.$res = res

    vehicles_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof vehicles_doc.active === 'undefined') {
      vehicles_doc.active = true
    }

    vehicles_doc.company = site.get_company(req)
    vehicles_doc.branch = site.get_branch(req)

    $vehicles.find({

      where: {

        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        $or: [{
          'name_ar': vehicles_doc.name_ar
        }, {
          'name_en': vehicles_doc.name_en
        }]

      }
    }, (err, doc) => {
      if (!err && doc) {

        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'vehicles',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!vehicles_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          vehicles_doc.code = cb.code;
        }

        $vehicles.add(vehicles_doc, (err, doc) => {
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

  site.post("/api/vehicles/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let vehicles_doc = req.body

    vehicles_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (vehicles_doc.id) {
      $vehicles.edit({
        where: {
          id: vehicles_doc.id
        },
        set: vehicles_doc,
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

  site.post("/api/vehicles/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $vehicles.findOne({
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

  site.post("/api/vehicles/delete", (req, res) => {
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
      $vehicles.delete({
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


  site.post("/api/vehicles/all", (req, res) => {
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

    where['company.id'] = site.get_company(req).id
    // where['branch.code'] = site.get_branch(req).code

    $vehicles.findMany({
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