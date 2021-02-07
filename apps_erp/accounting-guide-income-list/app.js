module.exports = function init(site) {
  const $accounting_guide_income_list = site.connectCollection("accounting_guide_income_list")

  // $accounting_guide_income_list.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $accounting_guide_income_list.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // })

  site.get({
    name: "accounting_guide_income_list",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/accounting_guide_income_list/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let accounting_guide_income_list_doc = req.body
    accounting_guide_income_list_doc.$req = req
    accounting_guide_income_list_doc.$res = res
    accounting_guide_income_list_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    accounting_guide_income_list_doc.company = site.get_company(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'guide_income_list',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!accounting_guide_income_list_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      accounting_guide_income_list_doc.code = cb.code;
    }

    $accounting_guide_income_list.add(accounting_guide_income_list_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/accounting_guide_income_list/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let accounting_guide_income_list_doc = req.body
    accounting_guide_income_list_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (accounting_guide_income_list_doc.id) {
      $accounting_guide_income_list.edit({
        where: {
          id: accounting_guide_income_list_doc.id
        },
        set: accounting_guide_income_list_doc,
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

  site.post("/api/accounting_guide_income_list/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $accounting_guide_income_list.findOne({
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

  site.post("/api/accounting_guide_income_list/delete", (req, res) => {
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
      $accounting_guide_income_list.delete({
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

  site.post("/api/accounting_guide_income_list/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.data.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }

    if (where['code']) {
      where['code'] = new RegExp(where['code'], 'i')
    }



    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id

    $accounting_guide_income_list.findMany({
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