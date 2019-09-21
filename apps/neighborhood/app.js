module.exports = function init(site) {
  const $neighborhood = site.connectCollection("neighborhood")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "neighborhood",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.on('[register][neighborhood][add]', doc => {

    $neighborhood.add({
      gov: {
        id: doc.id,
        name: doc.name
      },
      name: "حي إفتراضي" + " " + doc.company.name_ar,
      image_url: '/images/neighborhood.png',
      company: {
        id: doc.company.id,
        name_ar: doc.company.name_ar
      },
      branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar
      },
      active: true
    }, (err, doc) => {
      site.call('[register][area][add]', doc)

    })
  })



  site.post("/api/neighborhood/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let neighborhood_doc = req.body
    neighborhood_doc.$req = req
    neighborhood_doc.$res = res

    neighborhood_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof neighborhood_doc.active === 'undefined') {
      neighborhood_doc.active = true
    }

    neighborhood_doc.company = site.get_company(req)
    neighborhood_doc.branch = site.get_branch(req)

    $neighborhood.add(neighborhood_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/neighborhood/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let neighborhood_doc = req.body

    neighborhood_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (neighborhood_doc.id) {

      $neighborhood.edit({
        where: {
          id: neighborhood_doc.id
        },
        set: neighborhood_doc,
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

  site.post("/api/neighborhood/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $neighborhood.findOne({
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

  site.post("/api/neighborhood/delete", (req, res) => {
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
      $neighborhood.delete({
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

  site.post("/api/neighborhood/all", (req, res) => {

    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['gov']) {
      where['gov.id'] = where['gov'].id;
      delete where['gov']
      delete where.active
    }

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code


    $neighborhood.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
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