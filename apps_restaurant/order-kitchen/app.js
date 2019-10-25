module.exports = function init(site) {
  const $order_invoice = site.connectCollection("order_invoice")

  site.get({
    name: "order_kitchen",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })


  site.post("/api/order_kitchen/update", (req, res) => {
    let item = req.body
    $order_invoice.findOne({
      id: item.order.id,
    }, (err, doc) => {
      if (!err && doc) {
        doc.book_list.forEach(book_list => {
          if (book_list.size == item.size && book_list.barcode == item.barcode)
            book_list.done_kitchen = true;
        });
        $order_invoice.update(doc)
      }
    })
  })

  site.post("/api/order_kitchen/active_all", (req, res) => {
    let response = {
      done: false
    }
    let where = req.body.where || {}
    let kitchen = where['kitchen']
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    where['status.id'] = 1

    if (where['kitchen']) {
      where['book_list.kitchen.id'] = where['kitchen'].id;
      delete where['kitchen']
    }

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

        let book_list_report = [];
        docs.forEach(order => {
          order.book_list.forEach(itm => {
            if (itm.kitchen.id === kitchen.id && !itm.done_kitchen) {
              itm.order = {
                code: order.code,
                id: order.id,
              }
              book_list_report.push(itm);
            }
          });
        });

        response.list = book_list_report
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })



  /*   site.post("/api/order_kitchen/display_items", (req, res) => {
      let response = {
        done: false
      };
  
      if (!req.session.user) {
        response.error = 'Please Login First'
        res.json(response)
        return
      };
  
      let where = req.data.where || {};
  
      if (where['code']) {
        where['code'] = new RegExp(where['code'], 'i')
      };
  
      if (where['name']) {
        where['name'] = new RegExp(where['name'], 'i')
      };
  
      if (where.date) {
        let d1 = site.toDate(where.date)
        let d2 = site.toDate(where.date)
        d2.setDate(d2.getDate() + 1)
        where.date = {
          '$gte': d1,
          '$lt': d2
        }
      };
  
      if (where && where.date_from) {
        let d1 = site.toDate( where.date_from)
        let d2 = site.toDate(where.date_to)
        d2.setDate(d2.getDate() + 1);
        where.date = {
          '$gte': d1,
          '$lt': d2
        }
        delete where.date_from
        delete where.date_to
      };
      where['transaction_type.id'] = 2
  
      if (where['delivery_employee']) {
        where['delivery_employee.id'] = where['delivery_employee'].id;
        delete where['delivery_employee']
      };
  
      where['status.id'] = {
        '$gte': 4,
        '$lte': 5
      };
  
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
    }) */




  /*  site.post("/api/order_kitchen/display_items", (req, res) => {
     let response = {
       done: false
     }
     var where = req.body.where || {}
     if (where['code']) {
       where['code'] = new RegExp(where['code'], "i");
     }
     where['company.id'] = site.get_company(req).id
     where['branch.code'] = site.get_branch(req).code
 
     $order_kitchen.findMany({
       select: req.body.select || {},
       where: where,
       sort: req.body.sort || {
         id: -1
       },
       limit: req.body.limit
     }, (err, docs, count) => {
       if (!err) {
         response.done = true
 
         response.list = [];
         docs.forEach(b => {
           b.book_list.forEach(d => {
 
             if (b.code) {
               response.list.push({
                 code: b.code,
                 date: b.date,
                 name: d.name,
                 size: d.size,
                 vendor: d.vendor,
                 store: d.store,
                 count: d.count,
                 price: d.price,
                 total_price: d.total_price
 
               })
             }
           });
         });
 
         response.count = count
       } else {
         response.error = err.message
       }
       res.json(response)
     })
   })
  */
}