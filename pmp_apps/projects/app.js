module.exports = function init(site) {
  const $projects = site.connectCollection("projects")

  
  site.get_company = function (req) {
    let company = req.session('company')
    return site.fromJson(company)
  }
  site.get_branch = function (req) {
    let branch = req.session('branch')
    return site.fromJson(branch)
  }

  site.get({
    name: "projects",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post({
    name: '/api/times/all',
    path: __dirname + '/site_files/json/times.json'
  })



  
  site.post({
    name: "/api/project_status/all",
    path: __dirname + "/site_files/json/project_status.json"
  })


  site.post("/api/projects/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let projects_doc = req.body
    projects_doc.$req = req
    projects_doc.$res = res
    projects_doc.company = site.get_company(req)
    projects_doc.branch = site.get_branch(req)
    
    $projects.add(projects_doc, (err, doc) => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/projects/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let projects_doc = req.body

    if (projects_doc.id) {
      $projects.edit({
        where: {
          id: projects_doc.id
        },
        set: projects_doc,
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
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/projects/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $projects.findOne({
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

  site.post("/api/projects/delete", (req, res) => {
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
      $projects.delete({
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

  site.post("/api/projects/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    if (where['percent']) {
      where['percent'] = {
        '$gte': percent
      }
    }

    if (req.session.user && req.session.user.roles[0].name == 'tasks_developer') {
      where['developers_tracking_list.name.id'] = req.session.user.developer_id
    }




    $projects.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {},
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