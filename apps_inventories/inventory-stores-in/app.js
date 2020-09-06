module.exports = function init(site) {

  const $stores_in = site.connectCollection("stores_in")

  // $stores_in.deleteDuplicate({ number: 1 }, (err, result) => {
  //   $stores_in.createUnique({ number: 1 }, (err, result) => {
  //   })
  // })


  site.on('[stores_items][item_name][change]', objectStoreIn => {

    let barcode = objectStoreIn.sizes_list.map(_obj => _obj.barcode)

    $stores_in.findMany({ 'company.id': objectStoreIn.company.id, 'items.barcode': barcode }, (err, doc) => {
      doc.forEach(_doc => {
        if (_doc.items) _doc.items.forEach(_items => {
          if (objectStoreIn.sizes_list) objectStoreIn.sizes_list.forEach(_size => {
            if (_items.barcode == _size.barcode) {
              _items.size = _size.size
              _items.size_en = _size.size_en
              _items.name = _size.name
            }
          })
        });
        $stores_in.update(_doc);
      });
    });
  });

  site.on('[store_in][account_invoice][invoice]', (obj, callback, next) => {
    $stores_in.findOne({ id: obj }, (err, doc) => {
      if (doc) {
        doc.invoice = true
        $stores_in.update(doc, () => {
          next()
        });
      } else {
        next()
      }
    });
  });

  site.post({
    name: '/api/stores_in/types/all',
    path: __dirname + '/site_files/json/types.json'
  })

  site.get({
    name: "stores_in",
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

  $stores_in.newCode = function () {

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

  site.post("/api/stores_in/add", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let stores_in_doc = req.body

    stores_in_doc.company = site.get_company(req)
    stores_in_doc.branch = site.get_branch(req)
    stores_in_doc.number = $stores_in.newCode();
    stores_in_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

    stores_in_doc.$req = req
    stores_in_doc.$res = res

    stores_in_doc.date = site.toDateTime(stores_in_doc.date)

    stores_in_doc.items.forEach(itm => {
      itm.current_count = site.toNumber(itm.current_count)
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })

    stores_in_doc.total_value = site.toNumber(stores_in_doc.total_value)
    stores_in_doc.net_value = site.toNumber(stores_in_doc.net_value)

    if (stores_in_doc.type.id == 1) {

      stores_in_doc.return_paid = {
        items: stores_in_doc.items,
        total_discount: stores_in_doc.total_discount,
        total_value_added: stores_in_doc.total_value_added,
        total_tax: stores_in_doc.total_tax,
        total_value: stores_in_doc.total_value,
        net_value: stores_in_doc.net_value,
      }
    }

    site.isAllowOverDraft(req, stores_in_doc.items, cbOverDraft => {

      if (!cbOverDraft.overdraft && cbOverDraft.value && stores_in_doc.posting && stores_in_doc.type.id == 4) {

        response.error = 'OverDraft Not Active'
        res.json(response)

      } else {

        $stores_in.add(stores_in_doc, (err, doc) => {

          if (!err) {

            response.done = true
            response.doc = doc

            if (doc.posting) {

              doc.items.forEach((_itm, i) => {

                _itm.store = doc.store
                _itm.company = doc.company
                _itm.branch = doc.branch
                _itm.source_type = doc.type
                _itm.store_in = true
                _itm.number = doc.number
                _itm.vendor = doc.vendor
                _itm.date = doc.date
                _itm.current_status = 'storein'
                _itm.shift = {
                  id: doc.shift.id,
                  code: doc.shift.code,
                  name: doc.shift.name
                }

                if (doc.type.id == 4) {
                  _itm.set_average = 'minus_average'
                  _itm.type = 'minus'
                  _itm.count = (-Math.abs(_itm.count))
                  _itm.transaction_type = 'in'
                  site.returnStoresIn(doc, res => { })
                  site.quee('item_transaction + items', Object.assign({}, _itm))
                } else {
                  if (doc.type.id == 1)
                    _itm.set_average = 'sum_average'

                  _itm.type = 'sum'
                  _itm.transaction_type = 'in'
                  site.quee('item_transaction + items', Object.assign({}, _itm))
                }

                _itm.count = Math.abs(_itm.count)

                site.quee('[transfer_branch][stores_items][add_balance]', _itm)
              })

            }

          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })
  })


  site.post("/api/stores_in/update", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let stores_in_doc = req.body
    stores_in_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    stores_in_doc.vendor = site.fromJson(stores_in_doc.vendor)
    stores_in_doc.seasonName = stores_in_doc.seasonName
    stores_in_doc.type = site.fromJson(stores_in_doc.type)
    stores_in_doc.date = new Date(stores_in_doc.date)

    stores_in_doc.items.forEach(itm => {
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })

    stores_in_doc.total_value = site.toNumber(stores_in_doc.total_value)

    if (stores_in_doc.type.id == 1)
      stores_in_doc.return_paid = {
        items: stores_in_doc.items,
        total_discount: stores_in_doc.total_discount,
        total_value_added: stores_in_doc.total_value_added,
        total_tax: stores_in_doc.total_tax,
        total_value: stores_in_doc.total_value,
        net_value: stores_in_doc.net_value,
      }

    if (stores_in_doc._id) {
      $stores_in.edit({
        where: {
          _id: stores_in_doc._id
        },
        set: stores_in_doc,
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


  site.post("/api/stores_in/posting", (req, res) => {
    let response = {}
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    response.done = false

    let stores_in_doc = req.body

    stores_in_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })


    site.isAllowOverDraft(req, stores_in_doc.items, cbOverDraft => {

      if (!cbOverDraft.overdraft && cbOverDraft.value && stores_in_doc.posting && stores_in_doc.type.id == 4) {

        response.error = 'OverDraft Not Active'
        res.json(response)

      } else if (!cbOverDraft.overdraft && cbOverDraft.value && !stores_in_doc.posting && stores_in_doc.type.id != 4) {

        response.error = 'OverDraft Not Active'
        res.json(response)

      } else {

        if (stores_in_doc._id) {
          $stores_in.edit({
            where: {
              _id: stores_in_doc._id
            },
            set: stores_in_doc,
            $req: req,
            $res: res
          }, (err, result) => {
            if (!err) {
              response.done = true
              response.doc = result.doc

              result.doc.items.forEach((_itm, i) => {
                _itm.store = result.doc.store
                _itm.company = result.doc.company
                _itm.branch = result.doc.branch
                _itm.source_type = result.doc.type
                _itm.store_in = true
                _itm.number = result.doc.number
                _itm.vendor = result.doc.vendor
                _itm.date = result.doc.date
                _itm.shift = {
                  id: result.doc.shift.id,
                  code: result.doc.shift.code,
                  name: result.doc.shift.name
                }


                if (result.doc.posting) {
                  _itm.current_status = 'storein'

                  if (result.doc.type.id == 4) {
                    _itm.set_average = 'minus_average'
                    _itm.type = 'minus'
                    _itm.count = (-Math.abs(_itm.count))
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', Object.assign({}, _itm))
                  } else {
                    if (result.doc.type.id == 1)
                      _itm.set_average = 'sum_average'
                    _itm.type = 'sum'
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', Object.assign({}, _itm))
                  }



                } else {
                  _itm.current_status = 'r_storein'
                  if (result.doc.type.id == 4) {
                    _itm.set_average = 'sum_average'
                    _itm.type = 'sum'
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', Object.assign({}, _itm))
                  } else {
                    if (result.doc.type.id == 1)
                      _itm.set_average = 'minus_average'
                    _itm.type = 'minus'
                    _itm.count = (-Math.abs(_itm.count))
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', Object.assign({}, _itm))
                  }
                }
                _itm.count = Math.abs(_itm.count) // amr

                site.quee('[transfer_branch][stores_items][add_balance]', _itm)

              })

              if (result.doc.type && result.doc.type.id == 4) {
                if (!result.doc.posting)
                  result.doc.return = true
                site.returnStoresIn(result.doc, res => { })
              }

            } else {
              response.error = err.message
            }
            res.json(response)
          })
        } else {
          res.json(response)
        }
      }
    })
  })

  site.post("/api/stores_in/delete", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let stores_in_doc = req.body

    site.isAllowOverDraft(req, stores_in_doc.items, cbOverDraft => {

      if (!cbOverDraft.overdraft && cbOverDraft.value && stores_in_doc.posting && stores_in_doc.type.id != 4) {

        response.error = 'OverDraft Not Active'
        res.json(response)

      } else {

        if (stores_in_doc._id) {
          $stores_in.delete({
            where: {
              _id: stores_in_doc._id
            },
            $req: req,
            $res: res
          }, (err, result) => {
            if (!err) {
              response.done = true
              if (stores_in_doc.posting) {

                stores_in_doc.items.forEach((_itm, i) => {
                  _itm.store = stores_in_doc.store
                  _itm.company = stores_in_doc.company
                  _itm.branch = stores_in_doc.branch
                  _itm.source_type = stores_in_doc.type
                  _itm.store_in = true
                  _itm.number = stores_in_doc.number
                  _itm.vendor = stores_in_doc.vendor
                  _itm.date = stores_in_doc.date
                  _itm.current_status = 'd_storein'
                  _itm.shift = {
                    id: stores_in_doc.shift.id,
                    code: stores_in_doc.shift.code,
                    name: stores_in_doc.shift.name
                  }
                  if (result.doc.type.id == 4) {
                    _itm.set_average = 'sum_average'
                    _itm.type = 'sum'
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', Object.assign({}, _itm))
                  } else {
                    if (result.doc.type.id == 1)
                      _itm.set_average = 'minus_average'
                    _itm.type = 'minus'
                    _itm.count = (-Math.abs(_itm.count))
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', Object.assign({}, _itm))
                  }
                  _itm.count = Math.abs(_itm.count)
                  site.quee('[transfer_branch][stores_items][add_balance]', _itm)

                });

                if (stores_in_doc.type && stores_in_doc.type.id == 4) {
                  result.doc.return = true
                  site.returnStoresIn(stores_in_doc, res => { })

                }

              }
            }
            res.json(response)
          })
        } else res.json(response)

      }

    })
  })

  site.post("/api/stores_in/view", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    $stores_in.findOne({
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

  site.post("/api/stores_in/all", (req, res) => {
    let response = {}
    response.done = false

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
        'vendor.name': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'vendor.mobile': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'vendor.phone': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'vendor.national_id': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'vendor.email': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'store.name': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'store.number': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'store.payment_method.ar': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'store.payment_method.en': site.get_RegExp(search, "i")
      })

    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code


    if (where && where['notes']) {
      where['notes'] = site.get_RegExp(where['notes'], 'i')
    }

    if (where && where['number']) {
      where['number'] = site.get_RegExp(where['number'], 'i')
    }

    if (where && where['supply_number']) {
      where['supply_number'] = site.get_RegExp(where['supply_number'], 'i')
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

    if (where['name']) {
      where['items.name'] = site.get_RegExp(where['name'], 'i')
      delete where['name']
    }

    if (where['size']) {
      where['items.size'] = site.get_RegExp(where['size'], 'i')
      delete where['size']
    }

    if (where['size_en']) {
      where['items.size_en'] = site.get_RegExp(where['size_en'], 'i')
      delete where['size_en']
    }

    if (where['barcode']) {
      where['items.barcode'] = site.get_RegExp(where['barcode'], 'i')
      delete where['barcode']
    }


    if (where['shift_code']) {
      where['shift.code'] = where['shift_code']
      delete where['shift_code']
    }

    if (where['employee']) {
      where['employee.id'] = where['employee'].id;
      delete where['employee']
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

    if (where['vendor']) {
      where['vendor.id'] = where['vendor'].id;
      delete where['vendor']
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
      where['description'] = site.get_RegExp(where['description'], 'i')
    }

    delete where.search
    $stores_in.findMany({
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


  site.post("/api/stores_in/handel_store_in", (req, res) => {
    let response = {
      done: false
    }
    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id

    $stores_in.findMany({
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

              if (_doc.type.id == 1)
                _doc.return_paid = {
                  items: _doc.items,
                  total_discount: _doc.total_discount,
                  total_value_added: _doc.total_value_added,
                  total_tax: _doc.total_tax,
                  total_value: _doc.total_value,
                  net_value: _doc.net_value,
                }

              $stores_in.update(_doc)
            });
          }
        })

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.returnStoresIn = function (obj, res) {
    $stores_in.findOne({ number: obj.retured_number }, (err, doc) => {
      if (doc && doc.return_paid) {

        obj.items.forEach(_itemsObj => {
          doc.return_paid.items.forEach(_itemsDoc => {

            if (_itemsObj.barcode === _itemsDoc.barcode && _itemsObj.size == _itemsDoc.size) {


              if (_itemsObj.patch_list && _itemsObj.patch_list.length > 0) {

                if (_itemsDoc.patch_list && _itemsDoc.patch_list.length > 0) {

                  _itemsObj.patch_list.forEach(objPatch => {
                    _itemsDoc.patch_list.forEach(docPatch => {

                      if (objPatch.patch == docPatch.patch) {

                      }

                    });
                  });

                }
              }


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
          doc.return_paid.total_value_added = doc.return_paid.total_value_added + obj.total_value_added
          doc.return_paid.total_tax = doc.return_paid.total_tax + obj.total_tax
          doc.return_paid.total_value = doc.return_paid.total_value + obj.total_value
          doc.return_paid.net_value = doc.return_paid.net_value + obj.net_value
        } else {
          doc.return_paid.total_discount = doc.return_paid.total_discount - obj.total_discount
          doc.return_paid.total_value_added = doc.return_paid.total_value_added - obj.total_value_added
          doc.return_paid.total_tax = doc.return_paid.total_tax - obj.total_tax
          doc.return_paid.total_value = doc.return_paid.total_value - obj.total_value
          doc.return_paid.net_value = doc.return_paid.net_value - obj.net_value
        }
        doc.return_paid.total_discount = site.toNumber(doc.return_paid.total_discount)
        doc.return_paid.total_value_added = site.toNumber(doc.return_paid.total_value_added)
        doc.return_paid.total_tax = site.toNumber(doc.return_paid.total_tax)
        doc.return_paid.total_value = site.toNumber(doc.return_paid.total_value)
        doc.return_paid.net_value = site.toNumber(doc.return_paid.net_value)

        $stores_in.update(doc);
      }

    });
  };


  site.post("/api/stores_in/un_post", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $stores_in.findMany({
      select: req.body.select || {},
      where: { 'company.id': site.get_company(req).id },
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docs) => {
      if (!err) {
        docs.forEach(stores_in_doc => {
          stores_in_doc.posting = false;
          stores_in_doc.return_paid = null;
          $stores_in.update(stores_in_doc);
        });
      }
      response.done = true
      res.json(response)
    })
  })


  site.post("/api/stores_in/handel_zeft", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      res.json(response)
      return;
    }


    $stores_in.findMany({
      select: req.body.select || {},
      where: { 'company.id': site.get_company(req).id },
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docs) => {
      if (!err) {
        docs.forEach(stores_in_doc => {

          stores_in_doc.$req = req
          stores_in_doc.$res = res

          stores_in_doc.items.forEach(itm => {
            itm.current_count = site.toNumber(itm.current_count)
            itm.count = site.toNumber(itm.count)
            itm.cost = site.toNumber(itm.cost)
            itm.price = site.toNumber(itm.price)
            itm.total = site.toNumber(itm.total)
          })

          stores_in_doc.items.map(_item => _item.unit.id = 1)

          stores_in_doc.total_value = site.toNumber(stores_in_doc.total_value)
          stores_in_doc.net_value = site.toNumber(stores_in_doc.net_value)

          if (stores_in_doc.type.id == 1) {
            stores_in_doc.return_paid = {
              items: stores_in_doc.items,
              total_discount: stores_in_doc.total_discount,
              total_value_added: stores_in_doc.total_value_added,
              total_tax: stores_in_doc.total_tax,
              total_value: stores_in_doc.total_value,
              net_value: stores_in_doc.net_value,
            }
          }

          $stores_in.edit(stores_in_doc, (err, doc) => {

            if (!err) {

              response.done = true
              response.doc = doc

              if (doc.posting) {

                doc.items.forEach((_itm, i) => {

                  _itm.store = doc.store
                  _itm.company = doc.company
                  _itm.branch = doc.branch
                  _itm.source_type = doc.type
                  _itm.store_in = true
                  _itm.number = doc.number
                  _itm.vendor = doc.vendor
                  _itm.date = doc.date
                  _itm.current_status = 'storein'
                  _itm.shift = {
                    id: doc.shift.id,
                    code: doc.shift.code,
                    name: doc.shift.name
                  }

                  if (doc.type.id == 4) {
                    _itm.set_average = 'minus_average'
                    _itm.type = 'minus'
                    _itm.transaction_type = 'out'
                    site.returnStoresIn(doc, res => { })
                    site.quee('item_transaction - items', Object.assign({}, _itm))
                  } else {
                    if (doc.type.id == 1)
                      _itm.set_average = 'sum_average'

                    _itm.type = 'sum'
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', Object.assign({}, _itm))
                  }
                  site.quee('[transfer_branch][stores_items][add_balance]', _itm)
                })

              }

            } else {
              response.error = err.message
            }
            res.json(response)
          })
        });
      }
    })
  })



  site.post("/api/stores_in/post_all", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $stores_in.findMany({
      select: req.body.select || {},
      where: { 'company.id': site.get_company(req).id },
    }, (err, docs) => {

      if (!err) {

        docs.forEach(stores_in_doc => {
          stores_in_doc.posting = true

          if (stores_in_doc._id) {
            $stores_in.edit({
              where: {
                _id: stores_in_doc._id
              },
              set: stores_in_doc,
              $req: req,
              $res: res
            }, (err, result) => {
              if (!err) {
                response.done = true
                response.doc = result.doc

                result.doc.items.forEach((_itm, i) => {
                  _itm.store = result.doc.store
                  _itm.company = result.doc.company
                  _itm.branch = result.doc.branch
                  _itm.source_type = result.doc.type
                  _itm.store_in = true
                  _itm.number = result.doc.number
                  _itm.vendor = result.doc.vendor
                  _itm.date = result.doc.date
                  _itm.shift = {
                    id: result.doc.shift.id,
                    code: result.doc.shift.code,
                    name: result.doc.shift.name
                  }

                  _itm.current_status = 'storein'

                  if (result.doc.type.id == 4) {
                    _itm.set_average = 'minus_average'
                    _itm.type = 'minus'
                    _itm.count = (-Math.abs(_itm.count))
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', Object.assign({}, _itm))
                  } else {
                    if (result.doc.type.id == 1)
                      _itm.set_average = 'sum_average'
                    _itm.type = 'sum'
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', Object.assign({}, _itm))
                  }

                  _itm.count = Math.abs(_itm.count) // amr

                  site.quee('[transfer_branch][stores_items][add_balance]', _itm)

                })

                if (result.doc.type && result.doc.type.id == 4) {
                  if (!result.doc.posting)
                    result.doc.return = true
                  site.returnStoresIn(result.doc, res => { })
                }

              } else {
                response.error = err.message
              }
              res.json(response)
            })
          } else {
            res.json(response)
          }

        });

      }
      response.done = true
      res.json(response)
    })
  })


  //  site.getStoresIn = function (req, callback) {
  //   callback = callback || {};

  //   let where = req.data.where || {};
  //   where['company.id'] = site.get_company(req).id
  //   where['branch.code'] = site.get_branch(req).code
  //   where['invoice'] = false
  //   $stores_in.findOne({
  //     where: where
  //   }, (err, doc) => {
  //     if (!err && doc)
  //       callback(doc)
  //     else callback(false)
  //   })
  // } 

}