module.exports = function init(site) {
  const $students = site.connectCollection("customers")

  site.post({
    name: "/api/host/all",
    path: __dirname + "/site_files/json/host.json"

  })

  site.post({
    name: "/api/indentfy_students/all",
    path: __dirname + "/site_files/json/indentfy_students.json"

  })

  site.post({
    name: "/api/times_students/all",
    path: __dirname + "/site_files/json/times_students.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.get({
    name: "students",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/students/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let students_doc = req.body
    students_doc.$req = req
    students_doc.$res = res

    students_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof students_doc.active === 'undefined') {
      students_doc.active = true
    }

    students_doc.student = true
    students_doc.company = site.get_company(req)
    students_doc.branch = site.get_branch(req)

    $students.find({

      where: {
        
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,

        $or: [{
          'name': students_doc.name
        }, {
          'phone': students_doc.phone
        }, {
          'mobile': students_doc.mobile
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name , Phone Or mobile Exists'
        res.json(response)
      } else {
        $students.add(students_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc
            site.call('please add user', {
              email: doc.username,
              password: doc.password,
              roles: [{
                name: "students"
              }],
              students_id: doc.id,
              branch_list: [{}],
              is_students: true,
              profile: {
                name: doc.name,
                mobile: doc.mobile,
                image_url: students_doc.image_url
              }
            })

          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })
  })

  site.post("/api/students/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let students_doc = req.body

    students_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (students_doc.id) {
      $students.edit({
        where: {
          id: students_doc.id
        },
        set: students_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
          site.call('please add user', {
            email: students_doc.username,
            password: students_doc.password,
            roles: [{
              name: "students"
            }],
            students_id: students_doc.id,
            branch_list: [{}],
            is_students: true,
            profile: {
              name: students_doc.name,
              mobile: students_doc.mobile,
              image_url: students_doc.image_url
            }
          })
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

  site.post("/api/students/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $students.findOne({
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

  site.post("/api/students/delete", (req, res) => {
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
      $students.delete({
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

  site.post("/api/students/all", (req, res) => {
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

    if (where.search && where.search.age) {

      where['age'] = where.search.age
    }

    delete where.search


    if (req.session.user.roles[0].name === 'students') {
      where['id'] = req.session.user.students_id;
    }

    where['student'] = true
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $students.findMany({
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