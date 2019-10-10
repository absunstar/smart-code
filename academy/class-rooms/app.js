module.exports = function init(site) {
  const $class_rooms = site.connectCollection("class_rooms")

  site.post({
    name: "/api/period_class/all",
    path: __dirname + "/site_files/json/period_class.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "class_rooms",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/class_rooms/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let class_rooms_doc = req.body
    class_rooms_doc.$req = req
    class_rooms_doc.$res = res

    class_rooms_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof class_rooms_doc.active === 'undefined') {
      class_rooms_doc.active = true
    }

    class_rooms_doc.academy = site.get_company(req)
    class_rooms_doc.branch = site.get_branch(req)

    $class_rooms.find({
      where: {
        
        'academy.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        'name': class_rooms_doc.name
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $class_rooms.add(class_rooms_doc, (err, doc) => {
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

  site.post("/api/class_rooms/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let class_rooms_doc = req.body

    class_rooms_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (class_rooms_doc.id) {
      $class_rooms.edit({
        where: {
          id: class_rooms_doc.id
        },
        set: class_rooms_doc,
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

  site.post("/api/class_rooms/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $class_rooms.findOne({
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

  site.post("/api/class_rooms/delete", (req, res) => {
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
      $class_rooms.delete({
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

  site.post("/api/class_rooms/all", (req, res) => {
    
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }
    if (where.search && where.search.capaneighborhood) {
    
      where['capaneighborhood'] = where.search.capaneighborhood
    }

    if (where.search && where.search.current) {
    
      where['current'] = where.search.current
    }
    delete where.search

    where['academy.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $class_rooms.findMany({
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