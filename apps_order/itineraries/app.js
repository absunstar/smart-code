module.exports = function init(site) {
  const $itineraries = site.connectCollection("itineraries")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post({
    name: '/api/itineraries/types/all',
    path: __dirname + '/site_files/json/types.json'
  })


  site.get({
    name: "itineraries",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.on('[company][created]', doc => {
    $itineraries.add({
      name: "محكمة إفتراضية",
      image_url: '/images/itinerary.png',
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


  site.post("/api/itineraries/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let itineraries_doc = req.body
    itineraries_doc.$req = req
    itineraries_doc.$res = res

    itineraries_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof itineraries_doc.active === 'undefined') {
      itineraries_doc.active = true
    }

    itineraries_doc.company = site.get_company(req)
    itineraries_doc.branch = site.get_branch(req)


    $itineraries.add(itineraries_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/itineraries/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let itineraries_doc = req.body

    itineraries_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (itineraries_doc.id) {
      $itineraries.edit({
        where: {
          id: itineraries_doc.id
        },
        set: itineraries_doc,
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

  site.post("/api/itineraries/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $itineraries.findOne({
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

  site.post("/api/itineraries/delete", (req, res) => {
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
      $itineraries.delete({
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


  site.post("/api/itineraries/all", (req, res) => {
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

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lte': d2
      }
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lte': d2
      }
      delete where.date_from
      delete where.date_to
    }

    if (req.session.user.type === 'delegate') {
      where['delegate.id'] = req.session.user.ref_info.id;

    } else if (where['delegate']) {
      where['delegate.id'] = where['delegate'].id;
      delete where['delegate']
    }


    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $itineraries.findMany({
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