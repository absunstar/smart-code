module.exports = function init(site) {

  const $item_transaction = site.connectCollection("item_transaction")



  site.on('[stores_items][item_name][change]', objectTransaction => {

    let barcode = objectTransaction.sizes_list.map(_obj => _obj.barcode)

    $item_transaction.findMany({ 'company.id': objectTransaction.company.id, 'barcode': barcode }, (err, doc) => {
      if (doc) doc.forEach(_items => {
        if (objectTransaction.sizes_list) objectTransaction.sizes_list.forEach(_size => {
          if (_items.barcode == _size.barcode) {
            _items.size = _size.size
            _items.size_en = _size.size_en
          }
        })
        $item_transaction.update(_items);
      });
    });
  });

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

      $item_transaction.findMany({ sort: { id: -1 }, where: { 'barcode': itm.barcode, name: itm.name, 'branch.code': itm.branch.code, 'company.id': itm.company.id, 'store.id': itm.store.id, 'unit.id': itm.unit.id } }, (err, docs) => {

        delete itm._id
        delete itm.id
        // delete itm.type
        // delete itm.units_list

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
          // itm.last_price = docs[0].price
          itm.count = itm.count
          itm.current_status = itm.current_status
          $item_transaction.add(itm, () => {
            $item_transaction.trackBusy = false
          })

        } else {

          // itm.last_count = (itm.current_count || 0)  -  itm.count 
          itm.last_count = 0
          itm.current_count = itm.count
          // itm.last_price = itm.price
          itm.count = itm.count
          itm.current_status = itm.current_status
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
    // delete itm.type
    // delete itm.units_list

    $item_transaction.findMany({ sort: { id: -1 }, where: { 'barcode': itm.barcode, name: itm.name, 'branch.code': itm.branch.code, 'company.id': itm.company.id, 'store.id': itm.store.id, 'unit.id': itm.unit.id } }, (err, docs) => {

      if (docs && docs.length > 0) {

        itm.last_count = docs[0].current_count
        itm.current_count = itm.last_count - itm.count
        if(itm.cost == undefined || null){
          itm.cost = docs[0].cost
          itm.average_cost = docs[0].average_cost
        }
        // itm.last_price = docs[0].price
        itm.count = itm.count
        $item_transaction.add(itm, (err, doc) => {

          setTimeout(() => {
            $item_transaction.outBusy = false
          }, 200);
        })
      } else {

        itm.last_count = itm.current_count || 0
        itm.current_count = itm.last_count - itm.count
        itm.count = itm.count
        // itm.last_price = itm.price
        $item_transaction.add(itm, () => {
          setTimeout(() => {
            $item_transaction.outBusy = false
          }, 200);
        })
      }
    })
  })





  site.post({
    name: '/api/item_transaction/transaction_type/all',
    path: __dirname + '/site_files/json/transaction_type.json'
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


    if (where['in']) {
      where['transaction_type'] = 'in'
      delete where['in']
    }

    if (where['out']) {
      where['transaction_type'] = 'out'
      delete where['out']
    }

    if (where['t_type']) {

      if (where['t_type'].id == 1) {
        where['current_status'] = 'storein'

        if (where['t_status']) {
          where['source_type.id'] = where['t_status'].id;
          delete where['t_status']
        }
      }
      else if (where['t_type'].id == 2) {
        where['current_status'] = 'sold'
        if (where['t_status']) {
          where['source_type.id'] = where['t_status'].id;
          delete where['t_status']
        }
      }
      else if (where['t_type'].id == 3) where['current_status'] = 'Assembling'
      else if (where['t_type'].id == 4) where['current_status'] = 'Dismantling'
      else if (where['t_type'].id == 5) where['current_status'] = 'transferred'
      else if (where['t_type'].id == 6) where['current_status'] = 'stock'

      delete where['t_type']
    }


    // if (where['delete']) {
    //   let _d = 'd_'
    //   where['current_status'] = new RegExp(_d, 'i')

    //   delete where['delete']
    // }

    // if (where['un_post']) {
    //   let _r = 'r_'
    //   where['current_status'] = new RegExp(_r, 'i')
    //   delete where['un_post']
    // }


    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }

    if (where['barcode']) {
      where['barcode'] = new RegExp(where['barcode'], 'i')
    }

    if (where['size']) {
      where['size'] = new RegExp(where['size'], 'i')
    }

    if (where['vendor']) {
      where['vendor.id'] = where['vendor'].id;
      delete where['vendor']
    }

    if (where['store']) {
      where['store.id'] = where['store'].id;
      delete where['store']
    }

    if (where['item_group']) {
      where['item_group.id'] = where['item_group'].id;
      delete where['item_group']
    }


    if (where['store']) {
      where['store.id'] = where['store'].id;
      delete where['store']
    }

    if (where['shift_code']) {
      where['shift.code'] = new RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }


    // if (where['type_in']) {

    //   where['transaction_type'] = 'in'
    //   where['source_type.id'] = where['type_in'].id;
    //   delete where['type_in']
    // }

    // if (where['type_out']) {

    //   where['transaction_type'] = 'out'
    //   where['source_type.id'] = where['type_out'].id;
    //   delete where['type_out']
    // }

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


  site.post("/api/item_transaction/handel_item_transaction", (req, res) => {
    let response = {
      done: false
    }
    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id

    where['unit'] = null || undefined

    $item_transaction.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docs) => {
      if (!err) {
        response.done = true

        site.getDefaultSetting(req, callback => {

          let unit = {}
          if (callback.inventory.unit)
            unit = callback.inventory.unit

          if (unit.id)
            docs.forEach(_doc => {
              _doc.unit = {
                id: unit.id,
                name: unit.name,
                barcode: unit.barcode
              }

              $item_transaction.update(_doc)
            });
        })

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


}