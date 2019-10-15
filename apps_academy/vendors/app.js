module.exports = function init(site) {
  const $vendors = site.connectCollection("vendors")

  site.get({
    name: "vendors",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/vendors/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let vendors_doc = req.body
    vendors_doc.$req = req
    vendors_doc.$res = res
    
    vendors_doc.academy = site.get_company(req)
    vendors_doc.branch = site.get_branch(req)

    $vendors.add(vendors_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/vendors/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let vendors_doc = req.body

    if (vendors_doc.id) {
      $vendors.edit({
        where: {
          id: vendors_doc.id
        },
        set: vendors_doc,
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

  site.post("/api/vendors/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $vendors.findOne({
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

  site.post("/api/vendors/delete", (req, res) => {
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
      $vendors.delete({
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

  site.post("/api/vendors/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['name_ar']) {
      where['name_ar'] = new RegExp(where['name_ar'], 'i')
    }
    
    if (where['name_en']) {
      where['name_en'] = new RegExp(where['name_en'], 'i')
    }
    if (where['active'] !== 'all') {
      where['active'] = true
    } else {
      delete where['active']
    }

    where['academy.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    
    $vendors.findMany({
      select: req.body.select || {},
      where: where ,
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



  

  
    
  site.change_balance_ve = function (id,balance) {

    let response = {
      done: false
    }
    $vendors.findOne({
      where: {
        id: id
      }
    }, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc

        let b=response.doc.balance;
        response.doc.balance= b+balance;

        $vendors.edit({
          where: {
            id: response.doc.id
          },
          set: response.doc
        },(err , result) => {
          if (!err) {
            response.done = true
            response.doc = result.doc
          } else {
            return false
          }
          
        })

      } else {
        return false
      }

      return true
    })

    
  }

}