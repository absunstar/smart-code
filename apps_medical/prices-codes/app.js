module.exports = function init(site) {
  const $prices_codes = site.connectCollection("prices_codes")

  //  $prices_codes.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $prices_codes.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // }) 

  site.get({
    name: "prices_codes",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.on('[company][created]', doc => {

    $prices_codes.add({
      name_ar: "كود سعر إفتراضي",
      name_en: "Default Prices Codes",
      code: "1-Test",
      image_url: '/images/prices_codes.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar,
        name_en: doc.name_en
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar,
        name_en: doc.branch_list[0].name_en
      },
      active: true
    }, (err, doc) => {})
  })

  site.post("/api/prices_codes/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let prices_codes_doc = req.body
    prices_codes_doc.$req = req
    prices_codes_doc.$res = res
    prices_codes_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    prices_codes_doc.company = site.get_company(req)
    prices_codes_doc.branch = site.get_branch(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'prices_codes',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!prices_codes_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      prices_codes_doc.code = cb.code;
    }

    $prices_codes.add(prices_codes_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/prices_codes/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let prices_codes_doc = req.body
    prices_codes_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (prices_codes_doc.id) {
      $prices_codes.edit({
        where: {
          id: prices_codes_doc.id
        },
        set: prices_codes_doc,
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

  site.post("/api/prices_codes/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $prices_codes.findOne({
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

  site.post("/api/prices_codes/delete", (req, res) => {
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
      $prices_codes.delete({
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

  site.post("/api/prices_codes/all", (req, res) => {
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

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], 'i')
    }

    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], 'i')
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $prices_codes.findMany({
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