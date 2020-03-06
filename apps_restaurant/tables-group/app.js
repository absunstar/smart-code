module.exports = function init(site) {
  const $tables_group = site.connectCollection("tables_group")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "tables_group",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $tables_group.add({
      code: "1" ,
      name: "مجموعة طاولات إفتراضية",

      image_url: '/images/tables_group.png',
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
      site.call('[register][tables][add]', doc)

    })
  })

  site.post("/api/tables_group/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tables_group_doc = req.body
    tables_group_doc.$req = req
    tables_group_doc.$res = res

    tables_group_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof tables_group_doc.active === 'undefined') {
      tables_group_doc.active = true
    }

    tables_group_doc.company = site.get_company(req)
     tables_group_doc.branch = site.get_branch(req)
 
    $tables_group.find({
      where: {
        'company.id': site.get_company(req).id,
         'branch.code': site.get_branch(req).code,
         'name': tables_group_doc.name
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $tables_group.add(tables_group_doc, (err, doc) => {
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

  site.post("/api/tables_group/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tables_group_doc = req.body

    tables_group_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (tables_group_doc.id) {
      $tables_group.edit({
        where: {
          id: tables_group_doc.id
        },
        set: tables_group_doc,
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

  site.post("/api/tables_group/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $tables_group.findOne({
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

  site.post("/api/tables_group/delete", (req, res) => {
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
      $tables_group.delete({
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

  site.post("/api/tables_group/all", (req, res) => {
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
    
    if (where.search && where.search.salary) {

      where['salary'] = where.search.salary
    }

    delete where.search

    where['company.id'] = site.get_company(req).id
     where['branch.code'] = site.get_branch(req).code
 
    $tables_group.findMany({
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