module.exports = function init(site) {

  const $employees_degrees = site.connectCollection("hr_employees_degrees")

  site.get({
    name: "employees_degrees",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.post("/api/employees_degrees/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      res.json(response)
      return
    }

    let employees_degrees_doc = req.body
    employees_degrees_doc.$req = req
    employees_degrees_doc.$res = res

    employees_degrees_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof employees_degrees_doc.active === 'undefined') {
      employees_degrees_doc.active = true
    }

    employees_degrees_doc.company = site.get_company(req)
    employees_degrees_doc.branch = site.get_branch(req)

    $employees_degrees.add(employees_degrees_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/employees_degrees/update", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      res.json(response)
      return
    }

    let employees_degrees_doc = req.body

    employees_degrees_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (employees_degrees_doc.id) {
      $employees_degrees.edit({
        where: {
          id: employees_degrees_doc.id
        },
        set: employees_degrees_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/employees_degrees/delete", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      res.json(response)
      return
    }

    let id = req.body.id
    if (id) {
      $employees_degrees.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/employees_degrees/view", (req, res) => {
    let response = {}
    response.done = false
    $employees_degrees.find({
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

  site.post("/api/employees_degrees/all", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }

    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }
    
    if (where['salary']) {
      where['salary'] = where['salary']
    }

    where['company.id'] = site.get_company(req).id
/*     where['branch.code'] = site.get_branch(req).code
 */
    $employees_degrees.findMany({
      select: req.body.select || {},
      where: where,
      sort: {
        id: -1
      },

    }, (err, docs) => {
      if (!err) {
        response.done = true
        response.list = docs
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}