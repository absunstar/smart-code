module.exports = function init(site) {
  const $employee_list = site.connectCollection("employee_list")

  site.on('[register][employee_list][add]', doc => {
    $employee_list.add({
      name: doc.name,
      active: true,
      mobile: doc.mobile,
      username: doc.username,
      password: doc.password,
      image_url: doc.image_url
    }, (err, doc) => {
      if (!err && doc) {
        site.call('please add user', {
          id: doc.id,
          email: doc.username,
          password: doc.password,
          roles: [{
            module_name : "public" ,
            name: "employee_admin",
            en: "Employee Admin",
            ar: "ادارة الموظفين",
            permissions: ["employee_manage"]
          }],
          employee_id: doc.id,
          branch_list: [{}],
          is_employee: true,
          profile: {
            name: doc.name,
            mobile: doc.mobile,
            image_url: doc.image_url
          }
        })
      }
    })
  })

  site.on('[register][employee][add]', doc => {

    $employee_list.add({
      name: "موظف إفتراضي",
      image_url: '/images/employee_list.png',
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
    name: "/api/indentfy_employee/all",
    path: __dirname + "/site_files/json/indentfy_employee.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.get({
    name: "employees",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/employees/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let employee_doc = req.body
    employee_doc.$req = req
    employee_doc.$res = res

    employee_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof employee_doc.active === 'undefined') {
      employee_doc.active = true
    }

    employee_doc.company = site.get_company(req)
    employee_doc.branch = site.get_branch(req)

    $employee_list.find({

      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,

        $or: [{
          'name': employee_doc.name
        }, {
          'phone': employee_doc.phone
        }, {
          'mobile': employee_doc.mobile
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name , Phone Or mobile Exists'
        res.json(response)
      } else {

        let user = {};
        user = {
          name: employee_doc.name,
          mobile: employee_doc.mobile,
          username: employee_doc.username,
          email: employee_doc.username,
          password: employee_doc.password,
          image_url: employee_doc.image_url,
          branch_list: [{}],
          is_employee: true
        }

        user.roles = [{
          module_name : "public" ,
            name: "employee_admin",
            en: "Employee Admin",
            ar: "ادارة الموظفين",
            permissions: ["employee_manage"]
        }]

        user.profile = {
          name: user.name,
          mobile: user.mobile,
          image_url: user.image_url
        }

        user.ref_info = {
          id: employee_doc.id
        }

        $employee_list.add(employee_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc


            if (user.password && user.username) {
              user.employee_id = doc.id

              site.security.addUser(user, (err, doc1) => {
                if (!err) {
                  delete user._id
                  delete user.id
                  doc.user_info = {
                    id: doc1.id
                  }
                  $employee_list.edit(doc, (err2, doc2) => {
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

  site.post("/api/employees/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let employee_doc = req.body
    let user = {};
    user = {
      name: employee_doc.name,
      mobile: employee_doc.mobile,
      username: employee_doc.username,
      email: employee_doc.username,
      password: employee_doc.password,
      image_url: employee_doc.image_url,
      branch_list: [{}],
      is_employee: true
    }

    user.roles = [{
      module_name : "public" ,
      name: "employee_admin",
      en: "Employee Admin",
      ar: "ادارة الموظفين",
      permissions: ["employee_manage"]
    }]

    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url
    }

    user.ref_info = {
      id: employee_doc.id
    }

    employee_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (employee_doc.id) {
      $employee_list.edit({
        where: {
          id: employee_doc.id
        },
        set: employee_doc,
        $req: req,
        $res: res
      }, (err, employee_doc) => {
        if (!err) {
          response.done = true
          user.employee_id = employee_doc.doc.id

          if (!employee_doc.doc.user_info && user.password && user.username) {
            site.security.addUser(user, (err, doc1) => {
              if (!err) {
                delete user._id
                delete user.id
                employee_doc.doc.user_info = {
                  id: doc1.id
                }
                $employee_list.edit(employee_doc.doc, (err2, doc2) => { res.json(response) })
              } else {
                response.error = err.message
              }
              res.json(response)
            })
          } else if (employee_doc.doc.user_info && employee_doc.doc.user_info.id)
            site.security.updateUser(user, (err, user_doc) => {})

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

  site.post("/api/employees/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $employee_list.findOne({
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

  site.post("/api/employees/delete", (req, res) => {
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
      $employee_list.delete({
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

  site.post("/api/employees/all", (req, res) => {
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

    if (where['neighborhood']) {
      where['neighborhood.id'] = where['neighborhood'].id;
      delete where['neighborhood']
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

    if (req.session.user.roles[0].name === 'employee_admin') {
      where['id'] = req.session.user.employee_id;
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $employee_list.findMany({
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