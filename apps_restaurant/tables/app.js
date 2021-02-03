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


  table_busy_list = []
  site.on('[order_invoice][tables][busy]', obj => {
    table_busy_list.push(Object.assign({}, obj))
  })

  function table_busy_handle(obj) {
    if (obj == null) {
      if (table_busy_list.length > 0) {
        obj = table_busy_list[0]
        table_busy_handle(obj)
        table_busy_list.splice(0, 1)
      } else {
        setTimeout(() => {
          table_busy_handle(null)
        }, 1000);
      }
      return
    }

    $tables.edit(obj, () => {
      table_busy_handle(null)
    });
  }
  table_busy_handle(null)




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
      branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar
      },
      active: true
    }, (err, doc) => { })
  })



  site.post("/api/tables/add", (req, res) => {
    let response = {
      done: false
    }
    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let tables_doc = req.body
    tables_doc.$req = req
    tables_doc.$res = res

    user = {
      name: tables_doc.name,
      mobile: tables_doc.mobile,
      username: tables_doc.username,
      email: tables_doc.username,
      password: tables_doc.password,
      image_url: tables_doc.image_url,
      type: 'table'
    }

    user.roles = [
      {
        module_name: "public",
        name: "order_invoice_tables",
        en: "Order Invoice Tables",
        ar: "طلبات الطاولات",
        permissions: ["order_invoice_ui"]
      }
    ]

    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url
    }


    if (req.session.user) {

      tables_doc.company = site.get_company(req)
      tables_doc.branch = site.get_branch(req)

      user.branch_list = [{
        company: site.get_company(req),
        branch: site.get_branch(req)
      }]

    } else {
      tables_doc.active = true

      user.branch_list = [{
        company: tables_doc.company,
        branch: tables_doc.branch
      }]
    }

    user.company = tables_doc.company
    user.branch = tables_doc.branch


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
        'branch.code': site.get_branch(req).code,
        'name': tables_doc.name
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'tables',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!tables_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;
    
        } else if (cb.auto) {
          tables_doc.code = cb.code;
        }
        $tables.add(tables_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc

            if (user.password && user.username) {
              user.ref_info = { id: doc.id }
              site.security.addUser(user, (err, doc1) => {
                if (!err) {
                  delete user._id
                  delete user.id
                  doc.user_info = {
                    id: doc1.id
                  }
                  $tables.edit(doc, (err2, doc2) => {

                    res.json(response)
                  })
                } else {
                  response.error = err.message
                }
                res.json(response)
              })
            }

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


    user = {
      name: tables_doc.name_ar,
      mobile: tables_doc.mobile,
      username: tables_doc.username,
      email: tables_doc.username,
      password: tables_doc.password,
      image_url: tables_doc.image_url,
      type: 'table'
    }

    user.roles = [
      {
        module_name: "public",
        name: "order_invoice_tables",
        en: "Order Invoice Tables",
        ar: "طلبات الطاولات",
        permissions: ["order_invoice_ui"]
      }
    ]

    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url
    }
    user.ref_info = {
      id: tables_doc.id
    }

    user.branch_list = [{
      company: site.get_company(req),
      branch: site.get_branch(req)
    }]

    user.company = tables_doc.company
    user.branch = tables_doc.branch


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
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc

          if (!result.doc.user_info && user.password && user.username) {
            site.security.addUser(user, (err, doc1) => {
              if (!err) {
                delete user._id
                delete user.id
                result.doc.user_info = {
                  id: doc1.id
                }
                $tables.edit(result.doc, (err2, doc2) => {
                  res.json(response)
                })
              } else {
                response.error = err.message
              }
              res.json(response)
            })
          } else if (result.doc.user_info && result.doc.user_info.id) {
            site.security.updateUser(user, (err, user_doc) => { })
          }
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
          
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], "i");
    }


    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], "i");
    }

    if (where['tables_group']) {
      where['tables_group.id'] = where['tables_group'].id;
      delete where['tables_group']
    }

    //   if (where.search && where.search.salary) {

    //    where['salary'] = where.search.salary
    //  }

    //  delete where.search

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

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