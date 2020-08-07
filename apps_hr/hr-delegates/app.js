module.exports = function init(site) {
  const $delegate_list = site.connectCollection("hr_delegate_list")

  site.on('[company][created]', doc => {

    $delegate_list.add({
      name: "مندوب إفتراضي",
      image_url: '/images/delegate.png',
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

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "delegates",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/delegates/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let delegate_doc = req.body
    delegate_doc.$req = req
    delegate_doc.$res = res

    delegate_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof delegate_doc.active === 'undefined') {
      delegate_doc.active = true
    }

    delegate_doc.company = site.get_company(req)
    delegate_doc.branch = site.get_branch(req)

    $delegate_list.find({

      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,

        $or: [{
          'name': delegate_doc.name
        }, {
          'phone': delegate_doc.phone
        }, {
          'mobile': delegate_doc.mobile
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name , Phone Or mobile Exists'
        res.json(response)
      } else {


        let user = {};


        user = {
          name: delegate_doc.name,
          mobile: delegate_doc.mobile,
          username: delegate_doc.username,
          email: delegate_doc.username,
          password: delegate_doc.password,
          image_url: delegate_doc.image_url,
          type: 'delegate'
        }

        user.roles = [
          {
            module_name: "inventory",
            name: "stores_out_user",
            en: "Stores Out User",
            ar: "فاتورة مبيعات للمستخدم",
            permissions: ["stores_out_add",
              "stores_out_update",
              "stores_out_view",
              "stores_out_search",
              "stores_out_price",
              "stores_out_ui",
              "stores_out_print",
              "stores_out_export"]
          }]

        user.profile = {
          name: user.name,
          mobile: user.mobile,
          image_url: user.image_url
        }

        user.store = delegate_doc.store

        if (req.session.user) {

          delegate_doc.company = site.get_company(req)
          delegate_doc.branch = site.get_branch(req)

          user.branch_list = [{
            company: site.get_company(req),
            branch: site.get_branch(req)
          }]

        } else {
          delegate_doc.active = true

          user.branch_list = [{
            company: delegate_doc.company,
            branch: delegate_doc.branch
          }]
        }

        user.company = delegate_doc.company
        user.branch = delegate_doc.branch

        $delegate_list.add(delegate_doc, (err, doc) => {
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
                  $delegate_list.edit(doc, (err2, doc2) => {
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

  site.post("/api/delegates/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let delegate_doc = req.body
    let user = {}

    user = {
      name: delegate_doc.name,
      mobile: delegate_doc.mobile,
      username: delegate_doc.username,
      email: delegate_doc.username,
      password: delegate_doc.password,
      image_url: delegate_doc.image_url,
      type: 'delegate'
    }

    user.roles = [
      {
        module_name: "inventory",
        name: "stores_out_user",
        en: "Stores Out User",
        ar: "فاتورة مبيعات للمستخدم",
        permissions: ["stores_out_add",
          "stores_out_update",
          "stores_out_view",
          "stores_out_search",
          "stores_out_price",
          "stores_out_ui",
          "stores_out_print",
          "stores_out_export"]
      }]

    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url
    }

    user.ref_info = {
      id: delegate_doc.id
    }

    user.store = delegate_doc.store

    user.branch_list = [{
      company: site.get_company(req),
      branch: site.get_branch(req)
    }]


    user.company = delegate_doc.company
    user.branch = delegate_doc.branch

    delegate_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (delegate_doc.id) {
      $delegate_list.edit({
        where: {
          id: delegate_doc.id
        },
        set: delegate_doc,
        $req: req,
        $res: res
      }, (err, delegate_doc) => {
        if (!err) {
          response.done = true
          user.delegate_id = delegate_doc.doc.id

          if (!delegate_doc.doc.user_info && user.password && user.username) {
            site.security.addUser(user, (err, doc1) => {
              if (!err) {
                delete user._id
                delete user.id
                delegate_doc.doc.user_info = {
                  id: doc1.id
                }
                $delegate_list.edit(delegate_doc.doc, (err2, doc2) => {
                  res.json(response)
                })
              } else {
                response.error = err.message
              }
              res.json(response)
            })
          } else if (delegate_doc.doc.user_info && delegate_doc.doc.user_info.id) {
            site.security.updateUser(user, (err, user_doc) => { 
            })
          }
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

  site.post("/api/delegates/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $delegate_list.findOne({
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

  site.post("/api/delegates/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id
    let data = { name: 'trainer', id: req.body.id };

    site.getDataToDelete(data, callback => {

      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction'
        res.json(response)

      } else {
        if (id) {
          $delegate_list.delete({
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

  site.post("/api/delegates/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'name': new RegExp(search, "i")
      })

      where.$or.push({
        'mobile': new RegExp(search, "i")
      })

      where.$or.push({
        'phone': new RegExp(search, "i")
      })

      where.$or.push({
        'national_id': new RegExp(search, "i")
      })

      where.$or.push({
        'email': new RegExp(search, "i")
      })

    }

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
    if (where['area']) {
      where['area.id'] = where['area'].id;
      delete where['area']
      delete where.active
    }



    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }
    if (where['address']) {
      where['address'] = new RegExp(where['address'], "i");
    }
    if (where['national_id']) {
      where['national_id'] = new RegExp(where['national_id'], "i");
    }
    if (where['phone']) {
      where['phone'] = new RegExp(where['phone'], "i");
    }
    if (where['mobile']) {
      where['mobile'] = new RegExp(where['mobile'], "i");
    }

    if (where['email']) {
      where['email'] = new RegExp(where['email'], "i");
    }

    if (where['whatsapp']) {
      where['whatsapp'] = new RegExp(where['whatsapp'], "i");
    }
    if (where['facebook']) {
      where['facebook'] = new RegExp(where['facebook'], "i");
    }
    if (where['twitter']) {
      where['twitter'] = new RegExp(where['twitter'], "i");
    }

    if (req.session.user.type === 'delegate') {
      where['id'] = req.session.user.ref_info.id;
    }

    where['company.id'] = site.get_company(req).id

    $delegate_list.findMany({
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

  site.getEmployeeAttend = function (data, callback) {

    let select = {
      id: 1, name: 1,
      active: 1, finger_code: 1,
      indentfy: 1,
      company: 1, branch: 1
    }

    let where = { finger_code: data }

    $delegate_list.findOne({
      select: select,
      where: where,
    }, (err, doc) => {
      if (!err) {
        if (doc) callback(doc)
        else callback(false)
      }
    })
  }

}