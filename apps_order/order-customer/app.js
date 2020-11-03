module.exports = function init(site) {
  const $order_customer = site.connectCollection("order_customer")
  // const $stores_items = site.connectCollection("stores_items")


  site.on('[stores_items][item_name][change]', objectOrder => {

    let barcode = objectOrder.sizes_list.map(_object => _object.barcode)

    $order_customer.findMany({ 'company.id': objectOrder.company.id, 'book_list.barcode': barcode }, (err, doc) => {
      doc.forEach(_doc => {
        if (_doc.book_list) _doc.book_list.forEach(_items => {
          if (objectOrder.sizes_list) objectOrder.sizes_list.forEach(_size => {
            if (_items.barcode == _size.barcode) {
              _items.size = _size.size
              _items.size_en = _size.size_en
              _items.name = _size.name
            }
          })
        });
        $order_customer.update(_doc);
      });
    });
  });




  // order_paid_list = []
  // site.on('[account_invoices][order_customer][+]', obj => {
  //   order_paid_list.push(Object.assign({}, obj))
  // })

  // function order_paid_handle(obj) {
  //   if (obj == null) {
  //     if (order_paid_list.length > 0) {
  //       obj = order_paid_list[0]
  //       order_paid_handle(obj)
  //       order_paid_list.splice(0, 1)
  //     } else {
  //       setTimeout(() => {
  //         order_paid_handle(null)
  //       }, 1000);
  //     }
  //     return
  //   }

  //   $order_customer.findOne({ id: obj.invoice_id }, (err, doc) => {

  //     if (doc.under_paid) {



  //       if (obj.return) {
  //         doc.under_paid.net_value = doc.under_paid.net_value + obj.net_value;
  //         doc.under_paid.total_tax = doc.under_paid.total_tax + obj.total_tax;
  //         doc.under_paid.total_discount = doc.under_paid.total_discount + obj.total_discount;
  //         doc.under_paid.price_delivery_service = doc.under_paid.price_delivery_service + obj.price_delivery_service;
  //         doc.under_paid.service = doc.under_paid.service - obj.service;
  //       } else {
  //         doc.invoice = true;
  //         doc.under_paid.net_value = doc.under_paid.net_value - obj.net_value;
  //         doc.under_paid.total_tax = doc.under_paid.total_tax - obj.total_tax;
  //         doc.under_paid.total_discount = doc.under_paid.total_discount - obj.total_discount;
  //         doc.under_paid.price_delivery_service = doc.under_paid.price_delivery_service - obj.price_delivery_service;
  //         doc.under_paid.service = doc.under_paid.service - obj.service;
  //       }

  //       if (doc.under_paid.net_value <= 0) doc.status = { id: 5, en: "Closed & paid", ar: "مغلق و تم الدفع" }

  //       else if (obj.return && doc.under_paid.net_value == doc.net_value) doc.status = { id: 2, en: "Closed Of Orders Screen", ar: "مغلق من شاشة الأوردرات" }

  //       else doc.status = { id: 4, en: "Closed & Invoiced", ar: "مغلق و تم عمل فواتير" }

  //       doc.under_paid.book_list.forEach(book_list_basic => {
  //         obj.book_list.forEach(book_list_cb => {
  //           if (book_list_basic.barcode == book_list_cb.barcode) {

  //             if (obj.return) book_list_basic.count = book_list_basic.count + book_list_cb.count;
  //             else book_list_basic.count = book_list_basic.count - book_list_cb.count;

  //             let discount = 0;
  //             if (book_list_basic.discount) {
  //               if (book_list_basic.discount.type == 'number')
  //                 discount = book_list_basic.discount.value * book_list_basic.count;
  //               else if (book_list_basic.discount.type == 'percent')
  //                 discount = book_list_basic.discount.value * (book_list_basic.price * book_list_basic.count) / 100;
  //             }

  //             book_list_basic.total = (book_list_basic.count * book_list_basic.price) - discount;
  //           };
  //         });
  //       });
  //       $order_customer.update(doc, () => {
  //         order_paid_handle(null)
  //       });
  //     };
  //   });
  // };
  // order_paid_handle(null)



  // order_done_list = []
  // site.on('[account_invoices][order_customer][paid]', obj => {
  //   order_done_list.push(Object.assign({}, obj))
  // })

  // function order_done_handle(obj) {
  //   if (obj == null) {
  //     if (order_done_list.length > 0) {
  //       obj = order_done_list[0]
  //       order_done_handle(obj)
  //       order_done_list.splice(0, 1)
  //     } else {
  //       setTimeout(() => {
  //         order_done_handle(null)
  //       }, 1000);
  //     }
  //     return
  //   }

  //   $order_customer.findOne({ id: obj }, (err, doc) => {
  //     if (doc.under_paid.net_value <= 0) doc.status = { id: 5, en: "Closed & paid", ar: "مغلق و تم الدفع" }
  //     $order_customer.update(doc, () => {
  //       order_done_handle(null)
  //     });
  //   });
  // };
  // order_done_handle(null)




  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  };

  $order_customer.newCode = function () {

    let y = new Date().getFullYear().toString().substr(2, 2)
    let m = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][new Date().getMonth()].toString()
    let d = new Date().getDate()
    let lastCode = site.storage('order_last_code') || 0
    let lastMonth = site.storage('order_last_month') || m
    if (lastMonth != m) {
      lastMonth = m
      lastCode = 0
    }
    lastCode++
    site.storage('order_last_code', lastCode)
    site.storage('order_last_month', lastMonth)
    return 'O-C' + y + lastMonth + addZero(d, 2) + addZero(lastCode, 4)
  };

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  });

  site.post({
    name: '/api/order_customer/order_status/all',
    path: __dirname + '/site_files/json/order_status.json'
  });

  site.get({
    name: "order_customer",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  });

  site.post("/api/order_customer/add", (req, res) => {

    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let order_customer_doc = req.body
    order_customer_doc.$req = req
    order_customer_doc.$res = res

    order_customer_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    });

    if (typeof order_customer_doc.active === 'undefined') {
      order_customer_doc.active = true
    };

    order_customer_doc.company = site.get_company(req)
    order_customer_doc.branch = site.get_branch(req)
    order_customer_doc.code = $order_customer.newCode()
    order_customer_doc.image_url = '/images/order_customer.png'

    if (!order_customer_doc.status)
      order_customer_doc.status = {
        id: 1,
        en: "Opened",
        ar: "مفتوحة"
      }

      order_customer_doc.status_delivery = {
        id: 1,
        en: "Under Delivery",
        ar: "تحت التوصيل"
      };

    order_customer_doc.total_book_list = 0
    order_customer_doc.book_list.forEach(book_list => {
      order_customer_doc.total_book_list += book_list.total
    });

    if (order_customer_doc.status.id == 2)
    site.call('[order_customer][order_invoice][+]', Object.assign({}, order_customer_doc))

    $order_customer.add(order_customer_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  });

  site.post("/api/order_customer/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let order_customer_doc = req.body

    order_customer_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    order_customer_doc.total_book_list = 0
    order_customer_doc.book_list.forEach(book_list => {
      order_customer_doc.total_book_list += book_list.total
    })


    if (order_customer_doc.status.id == 2)
      site.call('[order_customer][order_invoice][+]', Object.assign({}, order_customer_doc))

    if (order_customer_doc.id) {
      $order_customer.edit({
        where: {
          id: order_customer_doc.id
        },
        set: order_customer_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err, result) {
          response.done = true
          response.doc = result.doc
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

  site.post("/api/order_customer/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $order_customer.findOne({
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

  site.post("/api/order_customer/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let order_customer_doc = req.body
    let id = req.body.id
    if (order_customer_doc.table) {
      let table = order_customer_doc.table
      table.busy = false
      site.call('[order_customer][tables][busy]', table)
    };

    if (id) {
      $order_customer.delete({
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

  site.post("/api/order_customer/all", (req, res) => {
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

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $order_customer.findMany({
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


  site.post("/api/order_customer/active_all", (req, res) => {
    let response = {
      done: false
    }
              
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    where['status.id'] = 1

    if (req.session.user && req.session.user.type == 'customer') {

      where['customer.id'] = req.session.user.ref_info.id
    }

    $order_customer.findMany({
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


  site.post("/api/order_customer/kitchen_items_all", (req, res) => {
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

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    where['status.id'] = 1
    $order_customer.findMany({
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


  site.post("/api/order_customer/invoices", (req, res) => {
    let response = {
      done: false
    }
          
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.body.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'table.name': site.get_RegExp(search, "i")
      })
      where.$or.push({
        'customer.name_ar': site.get_RegExp(search, "i")
      })
      where.$or.push({
        'tables_group.name': site.get_RegExp(search, "i")
      })
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    where['under_paid.net_value'] = { $gt: 0 }

    where['status.id'] = {
      '$gte': 2,
      '$lte': 5
    }

    if (req.data.order_customers_type && req.data.order_customers_type.id) {
      where['transaction_type.id'] = req.data.order_customers_type.id;
      delete where['transaction_type']
    }

    $order_customer.findMany({
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


  // site.getDataToDelete = function (data, callback) {

  //   let where = {};

  //   if (data.name == 'trainer') {
  //     where = {
  //       $or: [
  //         { 'delivery_employee.id': data.id },
  //         { 'add_user_info.id': data.id },
  //         { 'edit_user_info.id': data.id }
  //       ]
  //     }
  //   }

  //   else if (data.name == 'customer') where['customer.id'] = data.id
  //   else if (data.name == 'tables') where['table.id'] = data.id

  //   $order_customer.findOne({
  //     where: where,
  //   }, (err, docs, count) => {

  //     if (!err) {
  //       if (docs) callback(true)
  //       else callback(false)
  //     }
  //   })
  // }

}