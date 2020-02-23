module.exports = function init(site) {

  const $stores_assemble = site.connectCollection("stores_assemble")


  in_itemName_list = []
  site.on('[stores_items][item_name][change]', obj => {
    in_itemName_list.push(Object.assign({}, obj))
  })

  function in_itemName_handle(obj) {
    if (obj == null) {
      if (in_itemName_list.length > 0) {
        obj = in_itemName_list[0]
        in_itemName_handle(obj)
        in_itemName_list.splice(0, 1)
      } else {
        setTimeout(() => {
          in_itemName_handle(null)
        }, 1000);
      }
      return
    }

    let barcode = obj.sizes_list.map(_obj => _obj.barcode)
    let size = obj.sizes_list.map(_obj => _obj.size)

    $stores_assemble.findMany({ 'company.id': obj.company.id, 'items.size': size, 'items.barcode': barcode }, (err, doc) => {
      doc.forEach(_doc => {
        if (_doc.items) _doc.items.forEach(_items => {
          if (obj.sizes_list) obj.sizes_list.forEach(_size => {
            if (_items.barcode == _size.barcode)
              _items.size = _size.size
          })
        });
        $stores_assemble.update(_doc);
      });
      in_itemName_handle(null)
    });
  };
  in_itemName_handle(null)


  site.get({
    name: "stores_assemble",
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

  $stores_assemble.newCode = function () {

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

  site.post("/api/stores_assemble/add", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      res.json(response)
      return;
    }

    let stores_assemble_doc = req.body

    stores_assemble_doc.company = site.get_company(req)
    stores_assemble_doc.branch = site.get_branch(req)
    stores_assemble_doc.code = $stores_assemble.newCode();
    stores_assemble_doc.add_user_assemblefo = site.security.getUserFinger({ $req: req, $res: res })

    stores_assemble_doc.$req = req
    stores_assemble_doc.$res = res

    stores_assemble_doc.date = site.toDateTime(stores_assemble_doc.date)

    stores_assemble_doc.items.forEach(itm => {
      itm.current_count = site.toNumber(itm.current_count)
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })

    stores_assemble_doc.total_value = site.toNumber(stores_assemble_doc.total_value)
    stores_assemble_doc.net_value = site.toNumber(stores_assemble_doc.net_value)

    $stores_assemble.add(stores_assemble_doc, (err, doc) => {

      if (!err) {

        response.done = true
        response.doc = doc

        if (doc.posting) {
          let complex_list = [];

          doc.items.forEach(_itm => {
            _itm.type = 'sum'
            _itm.assemble = true
            _itm.store = doc.store
            _itm.company = doc.company
            _itm.branch = doc.branch

            site.call('[transfer_branch][stores_items][add_balance]', _itm)

            _itm.code = doc.code
            _itm.date = doc.date
            _itm.source_type = doc.type
            _itm.transaction_type = 'in'
            _itm.current_status = 'Assembling'
            _itm.shift = {
              id: doc.shift.id,
              code: doc.shift.code,
              name: doc.shift.name
            }

            if (_itm.complex_items && _itm.complex_items.length > 0) {
              _itm.complex_items.forEach(_complex => {
                _complex.type = 'minus'
                _complex.code = doc.code
                _complex.date = doc.date
                _complex.store = doc.store
                _complex.company = doc.company
                _complex.branch = doc.branch
                _complex.count = _complex.count * _itm.count
                _complex.transaction_type = 'out'
                _complex.current_status = 'Assembling'
                _complex.shift = {
                  id: doc.shift.id,
                  code: doc.shift.code,
                  name: doc.shift.name
                }
                complex_list.push(_complex)
              });
            }

            site.call('item_transaction + items', Object.assign({}, _itm))

          })

          complex_list.forEach(_complex => {
            site.call('[transfer_branch][stores_items][add_balance]', Object.assign({}, _complex))
            site.call('item_transaction - items', Object.assign({}, _complex))
          });

        }

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/stores_assemble/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_assemble_doc = req.body
    stores_assemble_doc.edit_user_assemblefo = site.security.getUserFinger({ $req: req, $res: res })

    stores_assemble_doc.vendor = site.fromJson(stores_assemble_doc.vendor)
    stores_assemble_doc.seasonName = stores_assemble_doc.seasonName
    stores_assemble_doc.type = site.fromJson(stores_assemble_doc.type)
    stores_assemble_doc.date = new Date(stores_assemble_doc.date)

    stores_assemble_doc.items.forEach(itm => {
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })

    stores_assemble_doc.total_value = site.toNumber(stores_assemble_doc.total_value)

    if (stores_assemble_doc._id) {
      $stores_assemble.edit({
        where: {
          _id: stores_assemble_doc._id
        },
        set: stores_assemble_doc,
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

  site.post("/api/stores_assemble/posting", (req, res) => {
    if (req.session.user === undefined)
      res.json(response)

    let response = {}
    response.done = false

    let stores_assemble_doc = req.body

    stores_assemble_doc.edit_user_assemblefo = site.security.getUserFinger({ $req: req, $res: res })

    if (stores_assemble_doc._id) {
      $stores_assemble.edit({
        where: {
          _id: stores_assemble_doc._id
        },
        set: stores_assemble_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc

          let complex_list = [];


          result.doc.items.forEach(_itm => {
            if (result.doc.posting)
              _itm.type = 'sum'
            else _itm.type = 'minus'
            _itm.assemble = true

            _itm.store = result.doc.store
            _itm.company = result.doc.company
            _itm.branch = result.doc.branch

            site.call('[transfer_branch][stores_items][add_balance]', _itm)

            _itm.code = result.doc.code
            _itm.date = result.doc.date
            _itm.source_type = result.doc.type
            if (result.doc.posting) {
              _itm.transaction_type = 'in'
              _itm.current_status = 'Assembling'
            } else {
              _itm.transaction_type = 'out'
              _itm.current_status = 'r_Assembling'
            }

            _itm.shift = {
              id: result.doc.shift.id,
              code: result.doc.shift.code,
              name: result.doc.shift.name
            }

            if (_itm.complex_items && _itm.complex_items.length > 0) {
              _itm.complex_items.forEach(_complex => {

                _complex.code = result.doc.code
                _complex.date = result.doc.date
                _complex.store = result.doc.store
                _complex.company = result.doc.company
                _complex.branch = result.doc.branch
                _complex.count = _complex.count * _itm.count
                if (result.doc.posting) {
                  _complex.type = 'minus'
                  _complex.transaction_type = 'out'
                  _complex.current_status = 'Assembling'
                }
                else {
                  _complex.transaction_type = 'in'
                  _complex.current_status = 'r_Assembling'
                  _complex.type = 'sum'
                }
                _complex.shift = {
                  id: result.doc.shift.id,
                  code: result.doc.shift.code,
                  name: result.doc.shift.name
                }
                complex_list.push(_complex)
              });
            }
            if (result.doc.posting)
              site.call('item_transaction + items', Object.assign({}, _itm))
            else site.call('item_transaction - items', Object.assign({}, _itm))

          })

          complex_list.forEach(_complex => {
            site.call('[transfer_branch][stores_items][add_balance]', Object.assign({}, _complex))
            if (result.doc.posting)
              site.call('item_transaction - items', Object.assign({}, _complex))
            else site.call('item_transaction + items', Object.assign({}, _complex))
          });



        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/stores_assemble/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_assemble_doc = req.body
    if (stores_assemble_doc._id) {
      $stores_assemble.delete({
        where: {
          _id: stores_assemble_doc._id
        },
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          if (stores_assemble_doc.posting) {

            let complex_list = [];


            result.doc.items.forEach(_itm => {
              _itm.type = 'minus'
              _itm.store = result.doc.store
              _itm.company = result.doc.company
              _itm.branch = result.doc.branch
              _itm.assemble = true

              site.call('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm))

              _itm.code = result.doc.code
              _itm.date = result.doc.date
              _itm.source_type = result.doc.type
              _itm.transaction_type = 'out'
              _itm.current_status = 'd_Assembling'
              _itm.shift = {
                id: result.doc.shift.id,
                code: result.doc.shift.code,
                name: result.doc.shift.name
              }

              if (_itm.complex_items && _itm.complex_items.length > 0) {
                _itm.complex_items.forEach(_complex => {
                  _complex.type = 'sum'
                  _complex.code = result.doc.code
                  _complex.date = result.doc.date
                  _complex.store = result.doc.store
                  _complex.company = result.doc.company
                  _complex.branch = result.doc.branch
                  _complex.count = _complex.count * _itm.count
                  _complex.transaction_type = 'in'
                  _complex.current_status = 'd_Assembling'
                  _complex.shift = {
                    id: result.doc.shift.id,
                    code: result.doc.shift.code,
                    name: result.doc.shift.name
                  }
                  complex_list.push(Object.assign({}, _complex))
                });
              }
              site.call('item_transaction - items', Object.assign({}, _itm))

            })

            complex_list.forEach(_complex => {
              site.call('[transfer_branch][stores_items][add_balance]', Object.assign({}, _complex))
              site.call('item_transaction + items', Object.assign({}, _complex))
            });

          }
          res.json(response)
        }
      })
    } else res.json(response)
  })

  site.post("/api/stores_assemble/view", (req, res) => {
    let response = {}
    response.done = false
    $stores_assemble.findOne({
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

  site.post("/api/stores_assemble/all", (req, res) => {
    let response = {}
    response.done = false
    let where = req.body.where || {}

    let search = req.body.search

    if (search) {
      where.$or = []

      where.$or.push({
        'vendor.name': new RegExp(search, "i")
      })

      where.$or.push({
        'vendor.mobile': new RegExp(search, "i")
      })

      where.$or.push({
        'vendor.phone': new RegExp(search, "i")
      })

      where.$or.push({
        'vendor.national_id': new RegExp(search, "i")
      })

      where.$or.push({
        'vendor.email': new RegExp(search, "i")
      })

      where.$or.push({
        'store.name': new RegExp(search, "i")
      })

      where.$or.push({
        'store.number': new RegExp(search, "i")
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

    if (where['description']) {
      where['description'] = new RegExp(where['description'], 'i')
    }

    delete where.search
    $stores_assemble.findMany({
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



}