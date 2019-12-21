module.exports = function init(site) {
  const $account_invoices = site.connectCollection("account_invoices")

  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  $account_invoices.newCode = function () {

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
    name: "account_invoices",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post({
    name: "/api/invoice_source_type/all",
    path: __dirname + "/site_files/json/invoice_source_type.json"
  })

  site.post({
    name: "/api/payment_method/all",
    path: __dirname + "/site_files/json/payment_method.json"
  })

  site.post("/api/account_invoices/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let account_invoices_doc = req.body;
    account_invoices_doc.$req = req;
    account_invoices_doc.$res = res;
    account_invoices_doc.company = site.get_company(req);
    account_invoices_doc.branch = site.get_branch(req);
    account_invoices_doc.code = $account_invoices.newCode();
    account_invoices_doc.remain_amount = account_invoices_doc.net_value - account_invoices_doc.paid_up;
    account_invoices_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (account_invoices_doc.paid_up && account_invoices_doc.safe) {
      account_invoices_doc.payment_list = [];
      account_invoices_doc.payment_list.push({
        date: account_invoices_doc.date,
        safe: account_invoices_doc.safe,
        paid_up: account_invoices_doc.paid_up
      })
    };

    account_invoices_doc.total_paid_up = 0
    account_invoices_doc.total_remain = 0

    if (account_invoices_doc.paid_up) {
      account_invoices_doc.total_paid_up = account_invoices_doc.paid_up
      account_invoices_doc.total_remain = account_invoices_doc.net_value - account_invoices_doc.total_paid_up
    };

    account_invoices_doc.items_price = 0

    account_invoices_doc.current_book_list.forEach(current_book_list => {
      account_invoices_doc.items_price += current_book_list.total_price
    });

    $account_invoices.add(account_invoices_doc, (err, doc) => {

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
            payment_method: doc.payment_method,
            safe: doc.safe
          }
          if (doc.source_type.id == 1)
            site.call('[account_invoices][safes][-]', paid_value)
          else if (doc.source_type.id == 2)
            site.call('[account_invoices][safes][+]', paid_value)

        };

        if (doc.source_type.id == 1)
          site.call('[store_in][account_invoice][invoice]', doc.invoice_id)

        else if (doc.source_type.id == 2)
          site.call('[store_out][account_invoice][invoice]', doc.invoice_id)

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/account_invoices/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let account_invoices_doc = req.body
    account_invoices_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    account_invoices_doc.total_paid_up = 0

    account_invoices_doc.total_remain = 0
    account_invoices_doc.payment_list.forEach(payment_list => {
      account_invoices_doc.total_paid_up += payment_list.paid_up
    });
    account_invoices_doc.total_remain = account_invoices_doc.net_value - account_invoices_doc.total_paid_up

    if (account_invoices_doc.id) {
      $account_invoices.edit({
        where: {
          id: account_invoices_doc.id
        },
        set: account_invoices_doc,
        $req: req,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
          /*  if (response.doc.remain_amount == 0)
             site.call('[account_invoices][order_invoice][paid]', response.doc.order_invoices_id) */
          if (response.doc.payment_safe) {
            let paid_value = {
              value: response.doc.payment_paid_up,
              company: response.doc.company,
              branch: response.doc.branch,
              date: response.doc.payment_date,
              image_url: response.doc.image_url,
              safe: response.doc.payment_safe,
              payment_method : response.doc.payment_method,
              type: 'Batch'
            }
            if (response.doc.source_type.id == 1)
              site.call('[account_invoices][safes][-]', paid_value)
            else if (response.doc.source_type.id == 2)
              site.call('[account_invoices][safes][+]', paid_value)

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

  site.post("/api/account_invoices/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $account_invoices.findOne({
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

  site.post("/api/account_invoices/delete", (req, res) => {
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
      $account_invoices.delete({
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

  site.post("/api/account_invoices/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['code'])
      where['code'] = new RegExp(where['code'], 'i')

    if (where['shift_code']) {
      where['shift.code'] = new RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }

    if (where['name'])
      where['name'] = new RegExp(where['name'], 'i')

    if (where['source_type']) {
      where['source_type.id'] = where['source_type'].id;
      delete where['source_type']
    }

    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method']
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

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $account_invoices.findMany({
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