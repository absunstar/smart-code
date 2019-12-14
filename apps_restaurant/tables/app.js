module.exports = function init(site) {
  const $tables = site.connectCollection("tables")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "tables",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[order_invoice][tables][busy]', doc => {
    $tables.edit(doc)
  })

  site.on('[register][tables][add]', doc => {

    $tables.add({
      tables_group: {
        id: doc.id,
        name: doc.name
      },
      code: "1",
      name: "طاولة إفتراضية",
      busy: false,
      image_url: '/images/tables.png',
      company: {
        id: doc.company.id,
        name_ar: doc.company.name_ar
      },
      /* branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar
      }, */
      active: true
    }, (err, doc) => { })
  })



  site.post("/api/tables/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tables_doc = req.body
    tables_doc.$req = req
    tables_doc.$res = res

    tables_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof tables_doc.active === 'undefined') {
      tables_doc.active = true
    }

    tables_doc.company = site.get_company(req)
    tables_doc.branch = site.get_branch(req)
    tables_doc.busy = false
    $tables.find({
      where: {
        'company.id': site.get_company(req).id,
/*         'branch.code': site.get_branch(req).code,
 */        'name': tables_doc.name
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $tables.add(tables_doc, (err, doc) => {
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

  site.post("/api/tables/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tables_doc = req.body

    tables_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (tables_doc.id) {
      $tables.edit({
        where: {
          id: tables_doc.id
        },
        set: tables_doc,
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

  site.post("/api/tables/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $tables.findOne({
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

  site.post("/api/tables/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id
    let data = { name: 'tables', id: req.body.id };

    site.getDataToDelete(data, callback => {

      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction'
        res.json(response)

      } else {
        if (id) {
          $tables.delete({
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

  site.post("/api/tables/all", (req, res) => {
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

    if (where['tables_group']) {
      where['tables_group.id'] = where['tables_group'].id;
      delete where['tables_group']
    }

    /*    if (where.search && where.search.salary) {
   
         where['salary'] = where.search.salary
       }
   
       delete where.search
    */
    where['company.id'] = site.get_company(req).id
/*     where['branch.code'] = site.get_branch(req).code
 */
    $tables.findMany({
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