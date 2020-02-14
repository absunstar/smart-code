module.exports = function init(site) {

  const $stores_out = site.connectCollection("stores_out")

  $stores_out.deleteDuplicate({ number: 1 }, (err, result) => {
    $stores_out.createUnique({ number: 1 }, (err, result) => {
    })
  })

  out_itemName_list = []
  site.on('[stores_items][item_name][change]', obj => {
    out_itemName_list.push(Object.assign({}, obj))
  })

  function out_itemName_handle(obj) {
    if (obj == null) {
      if (out_itemName_list.length > 0) {
        obj = out_itemName_list[0]
        out_itemName_handle(obj)
        out_itemName_list.splice(0, 1)
      } else {
        setTimeout(() => {
          out_itemName_handle(null)
        }, 1000);
      }
      return
    }

    let barcode = obj.sizes_list.map(_obj => _obj.barcode)
    let size = obj.sizes_list.map(_obj => _obj.size)

    $stores_out.findMany({ 'company.id': obj.company.id, 'items.size': size, 'items.barcode': barcode }, (err, doc) => {
      doc.forEach(_doc => {
        if (_doc.items) _doc.items.forEach(_items => {
          if (obj.sizes_list) obj.sizes_list.forEach(_size => {
            if (_items.barcode == _size.barcode)
              _items.size = _size.size
          })
        });
        $stores_out.update(_doc);
      });
      out_itemName_handle(null)

    });
  };
  out_itemName_handle(null)





  site.on('[store_out][account_invoice][invoice]', function (obj) {
    $stores_out.findOne({ id: obj }, (err, doc) => {
      doc.invoice = true
      $stores_out.update(doc);
    });
  });

  site.post({
    name: '/api/stores_out/types/all',
    path: __dirname + '/site_files/json/types.json'
  })

  site.get({
    name: "stores_out",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  $stores_out.newCode = function () {

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

  site.post("/api/stores_out/add", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_out_doc = req.body
    stores_out_doc.$req = req
    stores_out_doc.$res = res

    stores_out_doc.company = site.get_company(req)
    stores_out_doc.branch = site.get_branch(req)
    stores_out_doc.number = $stores_out.newCode();

    stores_out_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

    stores_out_doc.date = site.toDateTime(stores_out_doc.date)

    stores_out_doc.items.forEach(_itm => {
      _itm.current_count = site.toNumber(_itm.current_count)
      _itm.count = site.toNumber(_itm.count)
      _itm.cost = site.toNumber(_itm.cost)
      _itm.price = site.toNumber(_itm.price)
      _itm.total = site.toNumber(_itm.total)
    })

    stores_out_doc.total_value = site.toNumber(stores_out_doc.total_value)
    stores_out_doc.net_value = site.toNumber(stores_out_doc.net_value)

    if (stores_out_doc.type.id !== 5 || stores_out_doc.type.id !== 6)
      stores_out_doc.return_paid = {
        items: stores_out_doc.items,
        total_discount: stores_out_doc.total_discount,
        total_tax: stores_out_doc.total_tax,
        total_value: stores_out_doc.total_value,
        net_value: stores_out_doc.net_value,
      }

    $stores_out.add(stores_out_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc

        if (doc.posting) {

          doc.items.forEach(_itm => {
            if (doc.type.id == 6) {
              _itm.type = 'sum'
              _itm.transaction_type = 'in'
            } else {
              _itm.type = 'minus'
              _itm.transaction_type = 'out'
            }
            _itm.store = doc.store
            _itm.company = doc.company
            _itm.branch = doc.branch

            site.call('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm))

            _itm.number = doc.number
            _itm.current_status = 'sold'
            _itm.source_type = doc.type
            _itm.date = doc.date
            _itm.customer = doc.customer
            _itm.store = doc.store
            _itm.shift = {
              id: doc.shift.id,
              code: doc.shift.code,
              name: doc.shift.name
            }
            site.call('item_transaction - items', Object.assign({}, _itm))
          })

          if (doc.type && doc.type.id == 6)
            site.returnStoresOut(doc, res => { })
        }

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/stores_out/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_out_doc = req.body
    stores_out_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    stores_out_doc.type = site.fromJson(stores_out_doc.type)
    stores_out_doc.date = new Date(stores_out_doc.date)

    stores_out_doc.items.forEach(itm => {
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })

    if (stores_out_doc.type.id !== 5 || stores_out_doc.type.id !== 6)
      stores_out_doc.return_paid = {
        items: stores_out_doc.items,
        total_discount: stores_out_doc.total_discount,
        total_tax: stores_out_doc.total_tax,
        total_value: stores_out_doc.total_value,
        net_value: stores_out_doc.net_value,
      }

    stores_out_doc.total_value = site.toNumber(stores_out_doc.total_value)

    if (stores_out_doc._id) {
      $stores_out.edit({
        where: {
          _id: stores_out_doc._id
        },
        set: stores_out_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/stores_out/posting", (req, res) => {
    if (req.session.user === undefined)
      res.json(response)

    let response = {}
    response.done = false

    let stores_out_doc = req.body

    stores_out_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    if (stores_out_doc._id) {
      $stores_out.edit({
        where: {
          _id: stores_out_doc._id
        },
        set: stores_out_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc

          result.doc.items.forEach(_itm => {
            _itm.store = result.doc.store
            _itm.company = result.doc.company
            _itm.branch = result.doc.branch

            if (result.doc.posting) {
              if (result.doc.type.id == 6) {
                _itm.type = 'sum'
                _itm.transaction_type = 'in'
              } else {
                _itm.type = 'minus'
                _itm.transaction_type = 'out'
              }
              _itm.current_status = 'sold'
            } else {
              if (result.doc.type.id == 6) {
                _itm.type = 'minus'
                _itm.transaction_type = 'out'
              } else {
                _itm.type = 'sum'
                _itm.transaction_type = 'in'
              }
              _itm.current_status = 'r_sold'
            }

            site.call('[transfer_branch][stores_items][add_balance]', _itm)

            _itm.number = result.doc.number
            _itm.customer = result.doc.customer
            _itm.date = result.doc.date
            _itm.source_type = result.doc.type
            _itm.shift = {
              id: result.doc.shift.id,
              code: result.doc.shift.code,
              name: result.doc.shift.name
            }

            if (result.doc.posting)
              site.call('item_transaction - items', Object.assign({}, _itm))
            else site.call('item_transaction + items', Object.assign({}, _itm))

          })

          if (result.doc.type && result.doc.type.id == 6) {
            if (!result.doc.posting)
              result.doc.return = true
            site.returnStoresOut(result.doc, res => { })
          }

        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/stores_out/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_out_doc = req.body
    if (stores_out_doc._id) {
      $stores_out.delete({
        where: {
          _id: stores_out_doc._id
        },
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          if (stores_out_doc.posting) {

            stores_out_doc.items.forEach(_itm => {
              _itm._status = stores_out_doc.type.id
              _itm.store = stores_out_doc.store
              _itm.company = stores_out_doc.company
              _itm.branch = stores_out_doc.branch
              if (result.doc.type.id == 6) {
                _itm.type = 'minus'
                _itm.transaction_type = 'out'
              } else {
                _itm.type = 'sum'
                _itm.transaction_type = 'in'
              }
              _itm.current_status = 'd_sold'

              site.call('[transfer_branch][stores_items][add_balance]', _itm)
              delete _itm._status
              _itm.number = stores_out_doc.number
              _itm.customer = stores_out_doc.customer
              _itm.date = stores_out_doc.date
              _itm.source_type = stores_out_doc.type
              _itm.shift = {
                id: stores_out_doc.shift.id,
                code: stores_out_doc.shift.code,
                name: stores_out_doc.shift.name
              }

              site.call('item_transaction - items', Object.assign({}, _itm))

            });
            if (result.doc.type && result.doc.type.id == 6) {
              result.doc.return = true
              site.returnStoresOut(result.doc, res => { })
            }
          }

        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/stores_out/view", (req, res) => {
    let response = {}
    response.done = false
    $stores_out.findOne({
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

  site.post("/api/stores_out/all", (req, res) => {
    let response = {}
    response.done = false
    let where = req.body.where || {}

    let search = req.body.search || ''


    if (search) {
      where.$or = []
      where.$or.push({
        'customer.name': new RegExp(search, "i")
      })

      where.$or.push({
        'customer.mobile': new RegExp(search, "i")
      })

      where.$or.push({
        'customer.phone': new RegExp(search, "i")
      })

      where.$or.push({
        'customer.national_id': new RegExp(search, "i")
      })

      where.$or.push({
        'customer.email': new RegExp(search, "i")
      })

      where.$or.push({
        'store.number': new RegExp(search, "i")
      })

      where.$or.push({
        'store.name': new RegExp(search, "i")
      })

      where.$or.push({
        'store.type.ar': new RegExp(search, "i")
      })

      where.$or.push({
        'store.type.en': new RegExp(search, "i")
      })

      where.$or.push({
        'store.payment_method.ar': new RegExp(search, "i")
      })

      where.$or.push({
        'store.payment_method.en': new RegExp(search, "i")
      })
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (where && where['notes']) {
      where['notes'] = new RegExp(where['notes'], 'i')
    }

    if (where && where['number']) {
      where['number'] = new RegExp(where['number'], 'i')
    }

    if (where && where['supply_number']) {
      where['supply_number'] = new RegExp(where['supply_number'], 'i')
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
      where['shift.code'] = where['shift_code']
      delete where['shift_code']
    }

    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer']
    }

    if (where['delegate']) {
      where['delegate.id'] = where['delegate'].id;
      delete where['delegate']
    }


    if (where['type']) {
      where['type.id'] = where['type'].id;
      delete where['type']
    }

    if (where['source']) {
      where['source.id'] = where['source'].id;
      delete where['source']
    }

    if (where['total_discount']) {
      where['total_discount'] = where['total_discount'];
    }

    if (where['total_value']) {
      where['total_value'] = where['total_value'];
    }

    if (where['total_tax']) {
      where['total_tax'] = where['total_tax'];
    }

    if (where['nat_value']) {
      where['nat_value'] = where['nat_value'];
    }

    if (where['paid_up']) {
      where['paid_up'] = where['paid_up'];
    }

    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method']
    }

    if (where['safe']) {
      where['safe.id'] = where['safe'].id;
      delete where['safe']
    }

    if (where['value']) {
      where['value'] = where['value'];
    }

    if (where['description']) {
      where['description'] = new RegExp(where['description'], 'i')
    }


    $stores_out.findMany({
      select: req.body.select || {},
      limit: req.body.limit,
      where: where,
      sort: { id: -1 }
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



  site.post("/api/stores_out/handel_store_out", (req, res) => {
    let response = {
      done: false
    }
    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id

    $stores_out.findMany({
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

          if (unit.id) {

            docs.forEach(_doc => {
              _doc.items.forEach(_item => {
                if (_item.unit == null || undefined)
                  _item.unit = {
                    id: unit.id,
                    name: unit.name,
                    convert: 1
                  }
              });

              _doc.return_paid = {
                items: _doc.items,
                total_discount: _doc.total_discount,
                total_tax: _doc.total_tax,
                total_value: _doc.total_value,
                net_value: _doc.net_value,
              }
              $stores_out.update(_doc)
            });
          }
        })

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.returnStoresOut = function (obj, res) {
    $stores_out.findOne({ number: obj.retured_number }, (err, doc) => {

      obj.items.forEach(_itemsObj => {
        doc.return_paid.items.forEach(_itemsDoc => {

          if (_itemsObj.barcode == _itemsDoc.barcode && _itemsObj.size == _itemsDoc.size) {
            if (obj.return) _itemsDoc.count = _itemsDoc.count + _itemsObj.count

            else _itemsDoc.count = _itemsDoc.count - _itemsObj.count

            let discount = 0;
            if (_itemsDoc.discount) {
              if (_itemsDoc.discount.type == 'number')
                discount = _itemsDoc.discount.value * _itemsDoc.count;
              else if (_itemsDoc.discount.type == 'percent')
                discount = _itemsDoc.discount.value * (_itemsDoc.price * _itemsDoc.count) / 100;
            }

            _itemsDoc.total = (_itemsDoc.count * _itemsDoc.price) - discount;

          }
        });
      });
      if (obj.return) {
        doc.return_paid.total_discount = doc.return_paid.total_discount + obj.total_discount
        doc.return_paid.total_tax = doc.return_paid.total_tax + obj.total_tax
        doc.return_paid.total_value = doc.return_paid.total_value + obj.total_value
        doc.return_paid.net_value = doc.return_paid.net_value + obj.net_value
      } else {
        doc.return_paid.total_discount = doc.return_paid.total_discount - obj.total_discount
        doc.return_paid.total_tax = doc.return_paid.total_tax - obj.total_tax
        doc.return_paid.total_value = doc.return_paid.total_value - obj.total_value
        doc.return_paid.net_value = doc.return_paid.net_value - obj.net_value
      }
      doc.return_paid.total_discount = site.toNumber(doc.return_paid.total_discount)
      doc.return_paid.total_tax = site.toNumber(doc.return_paid.total_tax)
      doc.return_paid.total_value = site.toNumber(doc.return_paid.total_value)
      doc.return_paid.net_value = site.toNumber(doc.return_paid.net_value)

      $stores_out.update(doc);
    });
  };


  /*  site.getStoresOut = function (req, callback) {
     callback = callback || {};
 
     let where = req.data.where || {};
     where['company.id'] = site.get_company(req).id
     where['branch.code'] = site.get_branch(req).code
     where['invoice'] = false
     $stores_out.findOne({
       where: where
     }, (err, doc) => {
       if (!err && doc)
         callback(doc)
       else callback(false)
     })
   }
  */
}