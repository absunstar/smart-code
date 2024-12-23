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

  site.on('[register][vehicle_type][add]', obj => {

    $vehicles.add({
      name_Ar: "مركبة/سيارة إفتراضية",
      name_En: "Default Vehicle/Car",
      image_url: '/images/vehicles.png',
      code: "1-Test",
      default_driver : obj.delivery_employee,
      vehicle_type : obj.vehicles_types,
      company: {
        id: obj.vehicles_types.company.id,
        name_Ar: obj.vehicles_types.company.name_Ar,
        name_En: obj.vehicles_types.company.name_En
      },
      branch: {
        code: obj.vehicles_types.branch.code,
        name_Ar: obj.vehicles_types.branch.name_Ar,
        name_En: obj.vehicles_types.branch.name_En
      },
      active: true
    }, (err, doc1) => {

    })
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
          'name_Ar': vehicles_doc.name_Ar
        }, {
          'name_En': vehicles_doc.name_En
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

    if (where['name_Ar']) {
      where['name_Ar'] = site.get_RegExp(where['name_Ar'], "i");
    }

    if (where['name_En']) {
      where['name_En'] = site.get_RegExp(where['name_En'], "i");
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