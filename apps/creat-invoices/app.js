module.exports = function init(site) {
  const $creat_invoices = site.connectCollection("creat_invoices")

  $creat_invoices.deleteDuplicate({
    code: 1,
    'company.id': 1
  }, (err, result) => {
    $creat_invoices.createUnique({
      code: 1,
      'company.id': 1
    }, (err, result) => { })
  })

  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  $creat_invoices.newCode = function () {

    let y = new Date().getFullYear().toString().substr(2, 2)
    let m = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][new Date().getMonth()].toString()
    let d = new Date().getDate()
    let lastCode = site.storage('ticket_last_code') || 0
    let lastMonth = site.storage('ticket_last_month') || m
    if (lastMonth != m) {
      lastMonth = m
      lastCode = 0
    }
    lastCode++
    site.storage('ticket_last_code', lastCode)
    site.storage('ticket_last_month', lastMonth)
    return y + lastMonth + addZero(d, 2) + addZero(lastCode, 4)
  }

  site.get({
    name: "creat_invoices",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.post({
    name: "/api/source_type/all",
    path: __dirname + "/site_files/json/source_type.json"
  })

  site.post({
    name: "/api/payment_method/all",
    path: __dirname + "/site_files/json/payment_method.json"
  })

  site.post("/api/creat_invoices/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let creat_invoices_doc = req.body;
    creat_invoices_doc.$req = req;
    creat_invoices_doc.$res = res;
    creat_invoices_doc.company = site.get_company(req);
    creat_invoices_doc.branch = site.get_branch(req);
    creat_invoices_doc.code = $creat_invoices.newCode();
    creat_invoices_doc.remain_amount = creat_invoices_doc.net_value - creat_invoices_doc.paid_up;
    creat_invoices_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if(creat_invoices_doc.paid_up && creat_invoices_doc.safe){
      creat_invoices_doc.payment_list = [];
      creat_invoices_doc.payment_list.push({
        date : creat_invoices_doc.date,
        safe : creat_invoices_doc.safe,
        paid_up : creat_invoices_doc.paid_up

      })
    };
    $creat_invoices.add(creat_invoices_doc, (err, doc) => {

      if (!err) {
        response.done = true;
        response.doc = doc;

        if (doc.safe) {
          let paid_value = {
            value: doc.paid_up,
            company: doc.company,
            branch: doc.branch,
            date: doc.date,
            image_url: doc.image_url,
            safe: doc.safe
          }
          site.call('[creat_invoices][safes][+]', paid_value)
        };
        let under_paid = {
          book_list: doc.current_book_list,
          net_value: doc.net_value,
          total_tax: doc.total_tax,
          total_discount: doc.total_discount,
          price_delivery_service: doc.price_delivery_service,
          service: doc.service,
          order_invoices_id : doc.order_invoices_id
        }
        site.call('[creat_invoices][under_invoices][+]', under_paid)

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/creat_invoices/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let creat_invoices_doc = req.body
    creat_invoices_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (creat_invoices_doc.id) {
      $creat_invoices.edit({
        where: {
          id: creat_invoices_doc.id
        },
        set: creat_invoices_doc,
        $req: req,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
          if (response.doc.payment_safe) {
            
            let paid_value = {
              value: response.doc.payment_paid_up,
              company: response.doc.company,
              branch: response.doc.branch,
              date: response.doc.payment_date,
              image_url: response.doc.image_url,
              safe: response.doc.payment_safe
            }
            site.call('[creat_invoices][safes][+]', paid_value)
          }
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

  site.post("/api/creat_invoices/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $creat_invoices.findOne({
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

  site.post("/api/creat_invoices/delete", (req, res) => {
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
      $creat_invoices.delete({
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

  site.post("/api/creat_invoices/all", (req, res) => {
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
      where['code'] = new RegExp(where['code'], 'i')
    }

    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $creat_invoices.findMany({
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