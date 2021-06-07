module.exports = function init(site) {
  const $vendors = site.connectCollection("vendors")

  site.get({
    name: "vendors",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.on('[vendor][account_invoice][balance]', (obj, callback, next) => {

    $vendors.findOne({ id: obj.id }, (err, doc) => {

      if (doc) {

        if (!doc.balance_creditor) doc.balance_creditor = 0
        if (!doc.balance_debtor) doc.balance_debtor = 0

        if (obj.sum_creditor) {
          doc.balance_creditor += obj.balance_creditor
        } else if (obj.minus_creditor) {
          doc.balance_creditor -= obj.balance_creditor
        }

        if (obj.sum_debtor) {
          doc.balance_debtor += obj.balance_debtor
        } else if (obj.minus_debtor) {
          doc.balance_debtor -= obj.balance_debtor
        }

        $vendors.update(doc, () => {
          next()
        });

      } else {

        next()
      }


    });
  })


  site.on('[register][vendor][add]', doc => {

    $vendors.add({
      group: {
        id: doc.id,
        name_ar: doc.name_ar,
        name_en: doc.name_en,
      },
      code: "1-Test",
      name_ar: "مورد إفتراضي",
      name_en: "Default Vendor",
      balance_creditor : 0,
      balance_debtor : 0,
      credit_limit : 0,
      image_url: '/images/vendor.png',
      company: {
        id: doc.company.id,
        name_ar: doc.company.name_ar,
        name_en: doc.company.name_en
      },
      branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar,
        name_en: doc.branch.name_en
      },
      active: true
      /*  branch_list: [
         {
           charge: [{}]
         }
       ],
       currency_list: [],
       opening_balance: [
         {
           initial_balance: 0
         }
       ],
         bank_list: [{}],
       dealing_company: [{}],
       employee_delegate: [{}],
       accounts_debt: [{}], */

    }, (err, doc) => { })
  })




  site.post("/api/vendors/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let vendors_doc = req.body
    vendors_doc.$req = req
    vendors_doc.$res = res

    let num_obj = {
      company: site.get_company(req),
      screen: 'vendors',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!vendors_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      vendors_doc.code = cb.code;
    }

    vendors_doc.company = site.get_company(req)
    vendors_doc.branch = site.get_branch(req)

    $vendors.add(vendors_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/vendors/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let vendors_doc = req.body

    if (vendors_doc.id) {
      $vendors.edit({
        where: {
          id: vendors_doc.id
        },
        set: vendors_doc,
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

  site.post("/api/vendors/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $vendors.findOne({
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

  site.post("/api/vendors/delete", (req, res) => {
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
      $vendors.delete({
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

  site.post("/api/vendors/all", (req, res) => {
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
        'name_ar': site.get_RegExp(search, "i")
      })
      where.$or.push({
        'name_en': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'code': search
      })

    }

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], 'i')
    }

    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], 'i')
    }
    if (where['active'] !== 'all') {
      where['active'] = true
    } else {
      delete where['active']
    }

    where['company.id'] = site.get_company(req).id

    $vendors.findMany({
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