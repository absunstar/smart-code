module.exports = function init(site) {
  const $delivery_employee_list = site.connectCollection("hr_delivery_employee_list")

  site.on('[company][created]', doc => {

    $delivery_employee_list.add({
      name: "موظف توصيل إفتراضي",
      image_url: '/images/delivery_employee_list.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc) => { })
  })

  site.post({
    name: "/api/indentfy_delivery_employee/all",
    path: __dirname + "/site_files/json/indentfy_delivery_employee.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.get({
    name: "delivery_employees",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/delivery_employees/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let delivery_employee_doc = req.body
    delivery_employee_doc.$req = req
    delivery_employee_doc.$res = res

    delivery_employee_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof delivery_employee_doc.active === 'undefined') {
      delivery_employee_doc.active = true
    }

    delivery_employee_doc.company = site.get_company(req)
    delivery_employee_doc.branch = site.get_branch(req)

    $delivery_employee_list.find({

      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,

        $or: [{
          'name': delivery_employee_doc.name
        }, {
          'phone': delivery_employee_doc.phone
        }, {
          'mobile': delivery_employee_doc.mobile
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name , Phone Or mobile Exists'
        res.json(response)
      } else {

        let user = {};

        user = {
          name: delivery_employee_doc.name,
          mobile: delivery_employee_doc.mobile,
          username: delivery_employee_doc.username,
          email: delivery_employee_doc.username,
          password: delivery_employee_doc.password,
          image_url: delivery_employee_doc.image_url,
          branch_list: [{
            company: site.get_company(req),
            branch: site.get_branch(req)
          }],
          type: 'delivery',
          is_employee: true
        }


        user.roles = [{
          module_name: "public",
          name: "delivery_employee_admin",
          en: "Delivery Employee Admin",
          ar: "إدارة موظفين التوصيل",
          permissions: ["delivery_employee_manage"]
        }]

        user.profile = {
          name: user.name,
          mobile: user.mobile,
          image_url: user.image_url
        }

        user.ref_info = {
          id: delivery_employee_doc.id
        }

        $delivery_employee_list.add(delivery_employee_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc

            if (user.password && user.username) {
              user.delivery_employee_id = doc.id
              site.security.addUser(user, (err, doc1) => {
                if (!err) {
                  delete user._id
                  delete user.id
                  doc.user_info = {
                    id: doc1.id
                  }
                  $delivery_employee_list.edit(doc, (err2, doc2) => {
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

  site.post("/api/delivery_employees/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }



    let delivery_employee_doc = req.body
    let user = {};


    user = {
      name: delivery_employee_doc.name,
      mobile: delivery_employee_doc.mobile,
      username: delivery_employee_doc.username,
      email: delivery_employee_doc.username,
      type: 'delivery',
      password: delivery_employee_doc.password,
      image_url: delivery_employee_doc.image_url,
      branch_list: [{
        company: site.get_company(req),
        branch: site.get_branch(req)
      }],
      is_employee: true
    }

    if (req.session.user.roles && req.session.user.roles.length > 0) {
      user.roles = req.session.user.roles
    } else {
      user.roles = [{
        module_name: "public",
        name: "delivery_employee_admin",
        en: "Delivery Employee Admin",
        ar: "إدارة موظفين التوصيل",
        permissions: ["delivery_employee_manage"]
      }]
    }



    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url
    }

    user.ref_info = {
      id: delivery_employee_doc.id
    }

    delivery_employee_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (delivery_employee_doc.id) {
      $delivery_employee_list.edit({
        where: {
          id: delivery_employee_doc.id
        },
        set: delivery_employee_doc,
        $req: req,
        $res: res
      }, (err, delivery_employee_doc) => {
        if (!err) {
          response.done = true
          user.delivery_employee_id = delivery_employee_doc.doc.id
          if (!delivery_employee_doc.doc.user_info && user.password && user.username) {

            site.security.addUser(user, (err, doc1) => {
              if (!err) {
                delete user._id
                delete user.id
                delivery_employee_doc.doc.user_info = {
                  id: doc1.id
                }
                $delivery_employee_list.edit(delivery_employee_doc.doc, (err2, doc2) => { res.json(response) })
              } else {
                response.error = err.message
              }
              res.json(response)
            })
          } else if (delivery_employee_doc.doc.user_info && delivery_employee_doc.doc.user_info.id) {
            user.id = delivery_employee_doc.doc.user_info.id

            site.security.updateUser(user, (err, user_doc) => { })
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

  site.post("/api/delivery_employees/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $delivery_employee_list.findOne({
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

  site.post("/api/delivery_employees/delete", (req, res) => {
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
      $delivery_employee_list.delete({
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

  site.post("/api/delivery_employees/all", (req, res) => {
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

    if (where['job']) {
      where['job.id'] = where['job'].id;
      delete where['job']
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

    if (req.session.user.roles[0].name === 'delivery_employee_admin') {
      where['id'] = req.session.user.delivery_employee_id;
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $delivery_employee_list.findMany({
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