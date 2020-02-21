module.exports = function init(site) {
  const $goves = site.connectCollection("goves")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "goves",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.on('[company][created]', doc => {

    $goves.add({
      name: "محافظة إفتراضية",
      image_url: '/images/gov.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc) => {
      site.call('[register][city][add]', doc)

    })
  })


  site.post("/api/goves/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let goves_doc = req.body
    goves_doc.$req = req
    goves_doc.$res = res

    goves_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof goves_doc.active === 'undefined') {
      goves_doc.active = true
    }

    goves_doc.company = site.get_company(req)
    goves_doc.branch = site.get_branch(req)

    $goves.find({

      where: {
        
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        'name': goves_doc.name
      }
    }, (err, doc) => {
      if (!err && doc) {
        
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $goves.add(goves_doc, (err, doc) => {
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

  site.post("/api/goves/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let goves_doc = req.body

    goves_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (goves_doc.id) {
      $goves.edit({
        where: {
          id: goves_doc.id
        },
        set: goves_doc,
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

  site.post("/api/goves/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $goves.findOne({
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

  site.post("/api/goves/delete", (req, res) => {
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
      $goves.delete({
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


  site.post("/api/goves/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id

    $goves.findMany({
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