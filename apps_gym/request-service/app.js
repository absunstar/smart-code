module.exports = function init(site) {
  const $request_service = site.connectCollection("request_service")


  site.on('[create_invoices][request_service][+]', function (obj) {
    $request_service.findOne({ id: obj }, (err, doc) => {
      doc.invoice = true
      $request_service.update(doc);
    });
  });

  site.on('[register][request_service][add]', doc => {

    $request_service.add({
      code: "1",
      name: "طلب خدمة إفتراضية",
      image_url: '/images/request_service.png',
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
    name: "/api/period_class/all",
    path: __dirname + "/site_files/json/period_class.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "request_service",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/request_service/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let request_service_doc = req.body
    request_service_doc.$req = req
    request_service_doc.$res = res

    request_service_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof request_service_doc.active === 'undefined') {
      request_service_doc.active = true
    }

    request_service_doc.company = site.get_company(req)
    request_service_doc.branch = site.get_branch(req)

    if (request_service_doc.discountes && request_service_doc.discountes.length > 0) {
      request_service_doc.total_discount = 0
      request_service_doc.discountes.map(discountes => request_service_doc.total_discount += discountes.value)
    }

    $request_service.add(request_service_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/request_service/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let request_service_doc = req.body

    request_service_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (request_service_doc.discountes && request_service_doc.discountes.length > 0) {
      request_service_doc.total_discount = 0
      request_service_doc.discountes.map(discountes => request_service_doc.total_discount += discountes.value)
    }

    if (request_service_doc.id) {
      $request_service.edit({
        where: {
          id: request_service_doc.id
        },
        set: request_service_doc,
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

  site.post("/api/request_service/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $request_service.findOne({
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

  site.post("/api/request_service/delete", (req, res) => {
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
      $request_service.delete({
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

  site.post("/api/request_service/all", (req, res) => {

    let response = {
      done: false
    }

    let where = req.body.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'service.name': new RegExp(search, "i")
      })
      where.$or.push({
        'customer.name_ar': new RegExp(search, "i")
      })
      where.$or.push({
        'trainer.name': new RegExp(search, "i")
      })
      where.$or.push({
        'hall.name': new RegExp(search, "i")
      })
    }

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to
    }

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

    $request_service.findMany({
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