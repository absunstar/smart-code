module.exports = function init(site) {
  const $kitchen = site.connectCollection("kitchen")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "kitchen",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $kitchen.add({
      code: "1",
      name: "مطبخ إفتراضى",
      image_url: '/images/kitchen.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc) => { })
  })



  site.post("/api/kitchen/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let kitchen_doc = req.body
    kitchen_doc.$req = req
    kitchen_doc.$res = res

    kitchen_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof kitchen_doc.active === 'undefined') {
      kitchen_doc.active = true
    }

    kitchen_doc.company = site.get_company(req)
    kitchen_doc.branch = site.get_branch(req)

    $kitchen.find({
      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        'name': kitchen_doc.name
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $kitchen.add(kitchen_doc, (err, doc) => {
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

  site.post("/api/kitchen/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let kitchen_doc = req.body

    kitchen_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (kitchen_doc.id) {
      $kitchen.edit({
        where: {
          id: kitchen_doc.id
        },
        set: kitchen_doc,
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

  site.post("/api/kitchen/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $kitchen.findOne({
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

  site.post("/api/kitchen/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id
    let data = { name: 'kitchen', id: req.body.id };

    site.getKitchenToDelete(data, callback => {

      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction'
        res.json(response)

      } else {
        if (id) {
          $kitchen.delete({
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
      }
    })
  })

  site.post("/api/kitchen/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }
    if (where['code']) {
      where['code'] = new RegExp(where['code'], "i");
    }
    delete where.search
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $kitchen.findMany({
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