module.exports = function init(site) {
  const $oppenents_lawyers = site.connectCollection("oppenents_lawyers")

  site.get({
    name: "oppenents_lawyers",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.on('[company][created]', doc => {

    $oppenents_lawyers.add({
      group: {
        id: doc.id,
        name: doc.name
      },
      code: "1",
      name_ar: "محامي خصم إفتراضي",
      image_url: '/images/oppenent.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc1) => { })
  })

  site.post("/api/oppenents_lawyers/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let oppenents_lawyers_doc = req.body
    oppenents_lawyers_doc.$req = req
    oppenents_lawyers_doc.$res = res

    oppenents_lawyers_doc.company = site.get_company(req)
    oppenents_lawyers_doc.branch = site.get_branch(req)

    $oppenents_lawyers.add(oppenents_lawyers_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/oppenents_lawyers/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let oppenents_lawyers_doc = req.body

    if (oppenents_lawyers_doc.id) {
      $oppenents_lawyers.edit({
        where: {
          id: oppenents_lawyers_doc.id
        },
        set: oppenents_lawyers_doc,
        $req: req,
        $res: res
      }, (err, result) => {
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

  site.post("/api/oppenents_lawyers/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $oppenents_lawyers.findOne({
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

  site.post("/api/oppenents_lawyers/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id
    let data = { name: 'oppenent', id: req.body.id };

    site.getDataToDelete(data, callback => {

      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction'
        res.json(response)

      } else {
        if (id) {
          $oppenents_lawyers.delete({
            id: id,
            $req: req,
            $res: res
          }, (err, result) => {
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
      }
    })
  })

  site.post("/api/oppenents_lawyers/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'name_ar': site.get_RegExp(search, "i")
      })
      where.$or.push({
        'name_en': site.get_RegExp(search, "i")
      })
      where.$or.push({
        'mobile': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'phone': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'national_id': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'email': site.get_RegExp(search, "i")
      })

    }

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], 'i')
    }

    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], 'i')
    }
    if (where['active'] !== 'all') {
      where['active'] = true
    } else {
      delete where['active']
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $oppenents_lawyers.findMany({
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