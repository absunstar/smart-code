module.exports = function init(site) {
  const $vendors_group = site.connectCollection("vendors_group")

  site.get({
    name: "vendors_group",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.on('[register][vendors_group][add]', doc => {

    $vendors_group.add({
      name: "مجموعة موردين إفتراضية",
      code : "1",
      image_url: '/images/customer_groups.png',
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
      site.call('[register][vendor][add]', doc)

    })
  })



  site.post("/api/vendors_group/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let vendors_group_doc = req.body
    vendors_group_doc.$req = req
    vendors_group_doc.$res = res

    
    vendors_group_doc.company = site.get_company(req)
    vendors_group_doc.branch = site.get_branch(req)


    $vendors_group.add(vendors_group_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/vendors_group/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let vendors_group_doc = req.body

    if (vendors_group_doc.id) {
      $vendors_group.edit({
        where: {
          id: vendors_group_doc.id
        },
        set: vendors_group_doc,
        $req: req,
        $req: req,
        $res: res
      },(err , result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
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

  site.post("/api/vendors_group/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $vendors_group.findOne({
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

  site.post("/api/vendors_group/delete", (req, res) => {
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
      $vendors_group.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc=result.doc
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

  site.all("/api/vendors_group/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let where = req.data.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }
    if (where['active'] !== 'all') {
      where['active'] = true
    } else {
      delete where['active']
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    

    $vendors_group.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {id:-1},
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