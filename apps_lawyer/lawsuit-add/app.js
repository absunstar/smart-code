module.exports = function init(site) {
  const $lawsuit_add = site.connectCollection("lawsuit_add")

  //  $lawsuit_add.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $lawsuit_add.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // })

  site.get({
    name: "lawsuit_add",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/lawsuit_add/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let lawsuit_add_doc = req.body
    lawsuit_add_doc.$req = req
    lawsuit_add_doc.$res = res
    lawsuit_add_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    lawsuit_add_doc.company = site.get_company(req)
    lawsuit_add_doc.branch = site.get_branch(req)

    
    let num_obj = {
      company: site.get_company(req),
      screen: 'lawsuit_add',
      date: new Date()
    };
    let cb = site.getNumbering(num_obj);

    if (!lawsuit_add_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      lawsuit_add_doc.code = cb.code;
    }

    $lawsuit_add.add(lawsuit_add_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/lawsuit_add/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let lawsuit_add_doc = req.body
    lawsuit_add_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (lawsuit_add_doc.id) {
      $lawsuit_add.edit({
        where: {
          id: lawsuit_add_doc.id
        },
        set: lawsuit_add_doc,
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

  site.post("/api/lawsuit_add/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $lawsuit_add.findOne({
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

  site.post("/api/lawsuit_add/delete", (req, res) => {
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
      $lawsuit_add.delete({
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

  site.post("/api/lawsuit_add/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'number': search
      })
      where.$or.push({
        'year': search
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

    if (where['courts']) {
      where['courts.id'] = where['courts'].id;
      delete where['courts']
    }

    if (where['circle']) {
      where['circle.id'] = where['circle'].id;
      delete where['circle']
    }

    if (where['lawsuit_degree']) {
      where['lawsuit_degree.id'] = where['lawsuit_degree'].id;
      delete where['lawsuit_degree']
    }

    if (where['lawsuit_type']) {
      where['lawsuit_type.id'] = where['lawsuit_type'].id;
      delete where['lawsuit_type']
    }

    if (where['lawsuit_status']) {
      where['lawsuit_status.id'] = where['lawsuit_status'].id;
      delete where['lawsuit_status']
    }

    if (where['lawsuit_basic']) {
      where['lawsuit_basic.id'] = where['lawsuit_basic'].id;
      delete where['lawsuit_basic']
    }


    if (where['number']) {
      where['number'] = where['number']
    }

    if (where['year']) {
      where['year'] = where['year']
    }

    if (where['lawsuit_topic']) {
      where['lawsuit_topic'] = site.get_RegExp(where['lawsuit_topic'], 'i')
    }

    if (where['notes']) {
      where['notes'] = site.get_RegExp(where['notes'], 'i')
    }


    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $lawsuit_add.findMany({
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