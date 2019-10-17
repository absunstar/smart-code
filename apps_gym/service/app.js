module.exports = function init(site) {
  const $service = site.connectCollection("service")

  site.on('[company][created]', doc => {

    $service.add({
      code: "1" ,
      name: "خدمة إفتراضية",
      image_url: '/images/service.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc) => {})
  })

 /*  site.post({
    name: "/api/period_class/all",
    path: __dirname + "/site_files/json/period_class.json"

  }) */

  site.post({
    name: "/api/subscriptions_system/all",
    path: __dirname + "/site_files/json/subscriptions_system.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "service",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/service/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let service_doc = req.body
    service_doc.$req = req
    service_doc.$res = res

    service_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof service_doc.active === 'undefined') {
      service_doc.active = true
    }

    service_doc.company = site.get_company(req)
    service_doc.branch = site.get_branch(req)



    $service.find({
      where: {
        
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        'name': service_doc.name
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $service.add(service_doc, (err, doc) => {
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

  site.post("/api/service/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let service_doc = req.body

    service_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (service_doc.id) {
      $service.edit({
        where: {
          id: service_doc.id
        },
        set: service_doc,
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

  site.post("/api/service/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $service.findOne({
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

  site.post("/api/service/delete", (req, res) => {
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
      $service.delete({
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

  site.post("/api/service/all", (req, res) => {
    
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

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $service.findMany({
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