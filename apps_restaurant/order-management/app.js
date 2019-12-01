module.exports = function init(site) {
  const $order_invoice = site.connectCollection("order_invoice")

  site.get({
    name: "order_management",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/order_management/update_kitchen", (req, res) => {

    let response = {
      done: false
    }
    let item = req.body

    $order_invoice.findOne({
      id: item.order_id,
    }, (err, doc) => {

      if (!err && doc) {
        doc.book_list.forEach(book_list => {
          if (book_list.size == item.size && book_list.barcode == item.barcode)
            book_list.done_kitchen = false;
        });
        $order_invoice.update(doc, (err, result) => {
          response.done = true

          res.json(response)

        })
      }
    })
  })


  site.post("/api/order_management/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let order_management_doc = req.body

    order_management_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (order_management_doc.id) {
      $order_invoice.edit({
        where: {
          id: order_management_doc.id
        },
        set: order_management_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err, result) {
          response.done = true
          if (result.doc.reset_items && result.doc.status.id == 2 && result.doc.post) {
            $order_invoice.update(result.doc)
            result.doc.book_list.forEach(itm => {
              site.call('[order_invoice][stores_items][-]', Object.assign({}, itm))
              itm.company = result.doc.company
              itm.branch = result.doc.branch
              itm.number = result.doc.code
              itm.current_status = 'order'
              itm.date = result.doc.date
              itm.transaction_type = 'out'
              site.call('please out item', Object.assign({}, itm))
            })
          };

          if (result.doc.transaction_type && result.doc.transaction_type.id == 1 && result.doc.table.id) {

            if (result.doc.status.id == 1) {
              let table = result.doc.table
              table.busy = true
              site.call('[order_invoice][tables][busy]', table)
            }
          };

        } else {
          response.error = 'Code Already Exist'
        };
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    };
  })



  site.post("/api/order_management/all", (req, res) => {
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

    if (where['shift_code']) {
      where['shift.code'] = new RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }

    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method']
    }
    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer']
    }
    if (where['tables_group']) {
      where['tables_group.id'] = where['tables_group'].id;
      delete where['tables_group']
    }
    if (where['table']) {
      where['table.id'] = where['table'].id;
      delete where['table']
    }
    if (where['delivery_employee']) {
      where['delivery_employee.id'] = where['delivery_employee'].id;
      delete where['delivery_employee']
    }
    if (where['transaction_type']) {
      where['transaction_type.id'] = where['transaction_type'].id;
      delete where['transaction_type']
    }

    if (where['order_status']) {
      where['status.id'] = where['order_status'].id;
      delete where['order_status']
    }

    /*   where['status.id'] = {
        '$gte': 2,
        '$lte': 5
      }
   */

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $order_invoice.findMany({
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