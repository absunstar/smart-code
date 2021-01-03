module.exports = function init(site) {
  const $seating_numbers = site.connectCollection("seating_numbers")

  $seating_numbers.deleteDuplicate({
    code: 1,
    'company.id': 1
  }, (err, result) => {
    $seating_numbers.createUnique({
      code: 1,
      'company.id': 1
    }, (err, result) => { })
  })

  site.get({
    name: "seating_numbers",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.post("/api/seating_numbers/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let seating_numbers_doc = req.body
    seating_numbers_doc.$req = req
    seating_numbers_doc.$res = res
    seating_numbers_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    let num_obj = {
      company: site.get_company(req),
      screen: 'seating_numbers',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!seating_numbers_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      seating_numbers_doc.code = cb.code;
    }

    seating_numbers_doc.company = site.get_company(req)
    seating_numbers_doc.branch = site.get_branch(req)

    $seating_numbers.add(seating_numbers_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/seating_numbers/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let seating_numbers_doc = req.body
    seating_numbers_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (seating_numbers_doc.id) {
      $seating_numbers.edit({
        where: {
          id: seating_numbers_doc.id
        },
        set: seating_numbers_doc,
        $req: req,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
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

  site.post("/api/seating_numbers/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $seating_numbers.findOne({
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

  site.post("/api/seating_numbers/delete", (req, res) => {
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
      $seating_numbers.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
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

  site.post("/api/seating_numbers/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id

    $seating_numbers.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
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