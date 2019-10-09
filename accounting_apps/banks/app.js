module.exports = function init(site) {
  const $banks = site.connectCollection("banks")

  $banks.deleteDuplicate({
    code: 1,
    'company.id': 1
  }, (err, result) => {
    $banks.createUnique({
      code: 1,
      'company.id': 1
    }, (err, result) => {

    })
  })

  site.get({
    name: "banks",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/banks/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let banks_doc = req.body
    banks_doc.$req = req
    banks_doc.$res = res
    banks_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    banks_doc.company = site.get_company(req)
    
    let code = site.get_new_code(req, 2, 21)

    if (!code) {
      if (!banks_doc.code) {
        response.error = 'Please write Inventory code';
        res.json(response)
        return
      }
    } else {
      banks_doc.code = code.toString();
    }

    $banks.add(banks_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/banks/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let banks_doc = req.body
    banks_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    
    if (banks_doc.id) {
      $banks.edit({
        where: {
          id: banks_doc.id
        },
        set: banks_doc,
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

  site.post("/api/banks/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $banks.findOne({
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

  site.post("/api/banks/delete", (req, res) => {
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
      $banks.delete({
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

  site.post("/api/banks/all", (req, res) => {
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
    if (where['iban_number']) {
      where['iban_number'] = new RegExp(where['iban_number'], 'i')
    }
    if (where['bank_address']) {
      where['bank_address'] = new RegExp(where['bank_address'], 'i')
    }
    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id

    $banks.findMany({
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