module.exports = function init(site) {

  const $item_transaction = site.connectCollection("item_transaction")

  site.on('[stores_items][item_name][change]', obj => {
    let barcode = obj.sizes_list.map(_obj => _obj.barcode)
    let size = obj.sizes_list.map(_obj => _obj.size)

    $item_transaction.findMany({ 'company.id': obj.company.id, 'size': size, 'barcode': barcode }, (err, doc) => {
      if (doc) doc.forEach(_items => {
        if (obj.sizes_list) obj.sizes_list.forEach(_size => {
          if (_items.barcode == _size.barcode)
            _items.size = _size.size
        })
        $item_transaction.update(_items);
      });
    });
  });


  /*  $item_transaction.busy_status = false
   site.on('change item status', itm => {
     if ($item_transaction.busy_status == true) {
       setTimeout(() => {
         site.call('change item status', Object.assign(itm));
       }, 200);
       return
     };
 
     $item_transaction.busy_status = true
     $item_transaction.findOne({ sort: { id: 1 }, where: { size: itm.size, 'store.id': itm.store.id, name: itm.name, 'vendor.id': itm.vendor.id, current_status: 'debt', 'eng.id': itm.eng.id }, limit: 1 }, (err, docs) => {
       if (itm.current_status == "replaced" || itm.current_status == "sold") {
         docs.current_status = itm.current_status
         docs.ticket_code = itm.ticket_code
         $item_transaction.update(docs, (err, result) => {
           if (!err) {
             $item_transaction.busy_status = false
           };
         })
       };
     })
   }) */

  $item_transaction.trackBusy = false
  site.on('item_transaction + items', itm => {

    if ($item_transaction.trackBusy) {
      setTimeout(() => {
        site.call('item_transaction + items', itm)
      }, 400);
      return
    }

    if (itm) {

      $item_transaction.trackBusy = true

      $item_transaction.findMany({ sort: { id: -1 }, where: { 'barcode': itm.barcode, name: itm.name, 'branch.code': itm.branch.code, 'company.id': itm.company.id, 'store.id': itm.store.id } }, (err, docs) => {

        delete itm._id
        delete itm.id
        delete itm.type

        if (itm.current_status == 'damaged') {
          $item_transaction.update(itm, () => {
            $item_transaction.trackBusy = false
          })
        }

        if (itm.current_status == 'debt') {
          $item_transaction.update(itm, () => {
            $item_transaction.trackBusy = false
          })
        }

        if (itm.current_status == 'transferred') {
          $item_transaction.update(itm, () => {
            $item_transaction.trackBusy = false
          })
        }

        if (docs && docs.length > 0) {
          itm.last_count = docs[0].current_count
          itm.current_count = itm.last_count + itm.count

          itm.last_price = docs[0].price
          itm.current_status = itm.current_status || 'damaged'
          $item_transaction.add(itm, () => {
            $item_transaction.trackBusy = false
          })

        } else {
         
         // itm.last_count = (itm.current_count || 0)  -  itm.count 
          itm.last_count = itm.current_count
          itm.current_count = itm.last_count + itm.count
          itm.last_price = itm.price
          itm.current_status = itm.current_status || 'damaged'
          $item_transaction.add(itm, () => {
            $item_transaction.trackBusy = false
          })
        }
      })
    }

  })

  $item_transaction.outBusy = false
  site.on('item_transaction - items', itm => {

    if ($item_transaction.outBusy) {
      setTimeout(() => {
        site.call('item_transaction - items', Object.assign({}, itm))
      }, 400);
      return;
    }
    $item_transaction.outBusy = true

    delete itm.id
    delete itm._id
    delete itm.type

    $item_transaction.findMany({ sort: { id: -1 }, where: { 'barcode': itm.barcode, name: itm.name, 'branch.code': itm.branch.code, 'company.id': itm.company.id, 'store.id': itm.store.id } }, (err, docs) => {

      if (docs && docs.length > 0) {

        itm.last_count = docs[0].current_count
        itm.current_count = itm.last_count - itm.count
        itm.last_price = docs[0].price

        $item_transaction.add(itm, (err, doc) => {

          setTimeout(() => {
            $item_transaction.outBusy = false
          }, 200);
        })
      } else {
       
        itm.last_count = itm.current_count || 0
        itm.current_count = itm.last_count - itm.count
        itm.last_price = itm.price
        $item_transaction.add(itm, () => {
          setTimeout(() => {
            $item_transaction.outBusy = false
          }, 200);
        })
      }
    })
  })

  site.get({
    name: "item_transaction",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/item_transaction/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let _id = req.body._id


    if (_id) {
      $item_transaction.delete({ _id: $item_transaction.ObjectID(_id), $req: req, $res: res }, (err, result) => {
        if (!err) {
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })


  site.post("/api/item_transaction/view", (req, res) => {
    let response = {}
    response.done = false
    $item_transaction.findOne({
      where: {
        _id: site.mongodb.ObjectID(req.body._id)
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

  site.post("/api/item_transaction/all", (req, res) => {

    let response = {}
    let where = req.body.where || {}

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


    if (where && where.number) {
      where['number'] = new RegExp(where['number'], 'i')
    }

    if (where && where.size) {
      where['size'] = new RegExp(where['size'], 'i')
    }

    if (where && where.name) {
      where['name'] = new RegExp(where['name'], 'i')
    }

    if (where && where.ticket_code) {
      where['ticket_code'] = new RegExp(where['ticket_code'], 'i')
    }

    if (where['type_in']) {

      where['transaction_type'] = 'in'
      where['source_type.id'] = where['type_in'].id;
      delete where['type_in']
    }

    if (where['type_out']) {

      where['transaction_type'] = 'out'
      where['source_type.id'] = where['type_out'].id;
      delete where['type_out']
    }


    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    response.done = false
    $item_transaction.findMany({
      select: req.body.select || {},
      limit: req.body.limit,
      sort: req.body.sort || { id: -1 },
      where: where
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

  site.post("/api/item_transaction/get_size", (req, res) => {
    let response = {
      done: false
    }
    let where = {};
    where['barcode'] = req.body.barcode
    where['company.id'] = site.get_company(req).id
    $item_transaction.findOne({
      where: where
    }, (err, docs, count) => {
      if (!err) {
        if (docs) response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.getItemToDelete = function (data, callback) {
    let where = {};
    where['company.id'] = data.company_id
    where['barcode'] = { $in: data.barcodes }
    $item_transaction.findOne({
      where: where,
    }, (err, docs, count) => {
      if (!err) {
        if (docs) callback(true)
        else callback(false)
      }
    })
  }

}