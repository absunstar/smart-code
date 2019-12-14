module.exports = function init(site) {
  const $area = site.connectCollection("area")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "area",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.on('[register][area][add]', doc => {

    $area.add({
      gov: {
        id: doc.gov.id,
        name: doc.gov.name
      },
      city: {
        id: doc.id,
        name: doc.name
      },
      name: "منطقة إفتراضية",
      image_url: '/images/area.png',
      company: {
        id: doc.company.id,
        name_ar: doc.company.name_ar
      },
      branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar
      },
      active: true
    }, (err, doc) => { })
  })




  site.post("/api/area/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let area_doc = req.body
    area_doc.$req = req
    area_doc.$res = res

    area_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof area_doc.active === 'undefined') {
      area_doc.active = true
    }

    area_doc.company = site.get_company(req)
    area_doc.branch = site.get_branch(req)


    $area.add(area_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/area/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let area_doc = req.body

    area_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (area_doc.id) {

      $area.edit({
        where: {
          id: area_doc.id
        },
        set: area_doc,
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

  site.post("/api/area/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $area.findOne({
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

  site.post("/api/area/delete", (req, res) => {
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
      $area.delete({
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

  site.post("/api/area/all", (req, res) => {

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

    where['company.id'] = site.get_company(req).id
/*     where['branch.code'] = site.get_branch(req).code
 */
    $area.findMany({
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