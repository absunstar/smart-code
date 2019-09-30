module.exports = function init(site) {
  const $order_invoice = site.connectCollection("order_invoice")
  const $stores_items = site.connectCollection("stores_items")

  site.on('[creat_invoices][order_invoice][+]', function (obj) {
    $order_invoice.findOne({ id: obj.order_invoices_id }, (err, doc) => {

      doc.under_paid.net_value = doc.under_paid.net_value - obj.net_value;
      doc.under_paid.total_tax = doc.under_paid.total_tax - obj.total_tax;
      doc.under_paid.total_discount = doc.under_paid.total_discount - obj.total_discount;
      doc.under_paid.price_delivery_service = doc.under_paid.price_delivery_service - obj.price_delivery_service;
      doc.under_paid.service = doc.under_paid.service - obj.service;

      if (doc.under_paid) {
        if (doc.remain_amount == 0)
          doc.status = { id: 5, en: "Closed & paid", ar: "مغلق و تم الدفع" }
        else doc.status = { id: 4, en: "Closed & Invoiced", ar: "مغلق و تم عمل فواتير" }

        doc.under_paid.book_list.forEach(book_list_basic => {
          obj.book_list.forEach(book_list_cb => {
            if (book_list_basic.barcode == book_list_cb.barcode) {
              book_list_basic.count = book_list_basic.count - book_list_cb.count;
              book_list_basic.total_price = book_list_basic.count * book_list_basic.price;
            };
          });
        });
        $order_invoice.update(doc);
      };
    });
  });

  site.on('[creat_invoices][order_invoice][paid]', function (obj) {
    $order_invoice.findOne({ id: obj }, (err, doc) => {
      doc.status = { id: 5, en: "Closed & paid", ar: "مغلق و تم الدفع" }
      $order_invoice.update(doc);
    });
  });

  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  };

  $order_invoice.newCode = function () {

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
  };

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  });

  site.post({
    name: '/api/order_invoice/transaction_type/all',
    path: __dirname + '/site_files/json/transaction_type.json'
  });

  site.post({
    name: '/api/order_invoice/order_status/all',
    path: __dirname + '/site_files/json/order_status.json'
  });


  site.get({
    name: "order_invoice",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  });


  site.post("/api/order_invoice/add", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let order_invoice_doc = req.body
    order_invoice_doc.$req = req
    order_invoice_doc.$res = res

    order_invoice_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    });

    if (typeof order_invoice_doc.active === 'undefined') {
      order_invoice_doc.active = true
    };

    order_invoice_doc.company = site.get_company(req)
    order_invoice_doc.branch = site.get_branch(req)
    order_invoice_doc.code = $order_invoice.newCode()
    order_invoice_doc.first = true
    order_invoice_doc.image_url = '/images/order_invoice.png'

    if (!order_invoice_doc.status) {

      order_invoice_doc.status = {
        id: 1,
        en: "Opened",
        ar: "مفتوحة"
      }
    }
    order_invoice_doc.total_book_list = 0
    order_invoice_doc.book_list.forEach(book_list => {
      order_invoice_doc.total_book_list += book_list.total_price
    });

    $order_invoice.add(order_invoice_doc, (err, doc) => {

      if (!err) {
        response.done = true
        response.doc = doc
        if (!doc.active) {
          doc.book_list.forEach(itm => {
            site.call('[order_invoice][stores_items][-]', Object.assign({}, itm))
          });
        }
        if (doc.under_paid && doc.under_paid.order_invoice_id == null) {

          doc.under_paid.order_invoice_id = doc.id
          $order_invoice.update(doc)

        }
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  });

  site.post("/api/order_invoice/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let order_invoice_doc = req.body

    order_invoice_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    order_invoice_doc.total_book_list = 0
    order_invoice_doc.book_list.forEach(book_list => {
      order_invoice_doc.total_book_list += book_list.total_price
    });

    if (order_invoice_doc.id) {
      $order_invoice.edit({
        where: {
          id: order_invoice_doc.id
        },
        set: order_invoice_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err, result) {

          response.done = true
          if (!result.doc.active) {

            result.doc.book_list.forEach(itm => {
              site.call('[order_invoice][stores_items][-]', Object.assign({}, itm))
            });
          }
        } else {
          response.error = 'Code Already Exist'
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/order_invoice/invoices_update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let order_invoice_doc = req.body
    order_invoice_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (order_invoice_doc.id) {
      $order_invoice.edit({
        where: {
          id: order_invoice_doc.id
        },
        set: order_invoice_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err, result) {
          response.done = true
        } else {
          response.error = 'Code Already Exist'
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })


  site.post("/api/order_invoice/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $order_invoice.findOne({
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

  site.post("/api/order_invoice/delete", (req, res) => {
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
      $order_invoice.delete({
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


  site.post("/api/stores_items/load", (req, res) => {
    let response = {
      done: false
    }
    $stores_items.findMany({
      where: {

        'company.id': site.get_company(req).id,
        'branch.id': site.get_branch(req).id,

      }
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

  site.post("/api/order_invoice/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $order_invoice.findMany({
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


  site.post("/api/order_invoice/active_all", (req, res) => {
    let response = {
      done: false
    }
    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    
    if(where['id']){
      where['book_list.kitchen.id'] = where['id'];
    }

    where['status.id'] = 1
    $order_invoice.findMany({
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
        console.log(count);

        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.post("/api/order_invoice/kitchen_items_all", (req, res) => {
    let response = {
      done: false
    }
    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    where['status.id'] = 1
    $order_invoice.findMany({
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


  site.post("/api/order_invoice/invoices", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'table.name': new RegExp(search, "i")
      })
      where.$or.push({
        'customer.name': new RegExp(search, "i")
      })
      where.$or.push({
        'tables_group.name': new RegExp(search, "i")
      })
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    where['status.id'] = {
      '$gte': 2,
      '$lt': 4
    }


    where['under_paid.net_value'] = { $gt: 0 }
    /*   where['transaction_type.id'] = where['transaction_type']
      delete where['transaction_type'] */
    $order_invoice.findMany({
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



  /*   const $under_delivery = site.connectCollection("under_delivery")
   */


  /*  site.post("/api/under_delivery/delete", (req, res) => {
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
       $under_delivery.delete({
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
   }) */

  /* site.post("/api/under_delivery/all", (req, res) => {
   let response = {
     done: false
   }

   let where = req.body.where || {}

   if (where['name']) {
     where['name'] = new RegExp(where['name'], "i");
   }

   where['company.id'] = site.get_company(req).id
   where['branch.code'] = site.get_branch(req).code

   $under_delivery.findMany({
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
 }) */

  /*  site.post("/api/items_group_by_item/all", (req, res) => {
     let response = {
       done: false
     }
 
     let where = {
       'company.id': site.get_company(req).id,
       'branch.id': site.get_branch(req).id,
     }
 
     $items_group.findMany({
       select: req.body.select || {},
       where: where,
       sort: req.body.sort || {
         id: -1
       },
       limit: req.body.limit
     }, (err, docs, count) => {
 
       response.done = true
       response.list = docs
 
       $stores_items.findMany({
         where: where
       }, (err2, docs2, count2) => {
         if (!err) {
           response.done = true
 
           docs.forEach(el => {
             docs2.forEach(itm => {
               if (el.id == itm.item_group.id) {
                 if (el.itemListn) {
                   el.itemListn.push(itm)
                 } else {
 
                   el.itemListn = [itm]
                 }
               }
             })
             response.list = docs
 
           });
           response.count = count
         } else {
           response.error = err.message
         }
         res.json(response)
       })
     })
   })
  */

  /*  site.post("/api/under_delivery/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
  
    let under_delivery_doc = req.body
    under_delivery_doc.$req = req
    under_delivery_doc.$res = res
    delete under_delivery_doc.cr_it
  
    under_delivery_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
  
    if (typeof under_delivery_doc.active === 'undefined') {
      under_delivery_doc.active = true
    }
  
    under_delivery_doc.company = site.get_company(req)
    under_delivery_doc.branch = site.get_branch(req)
    under_delivery_doc.image_url = '/images/under_delivery.png'
    $under_delivery.add(under_delivery_doc, (err, doc) => {
      if (!err) {
  
        response.done = true
        response.doc = doc
  
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  }) */


}