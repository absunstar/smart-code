module.exports = function init(site) {

  const $units_switch = site.connectCollection("units_switch")


  site.on('[stores_items][item_name][change]', objectAssemble => {

    let barcode = objectAssemble.sizes_list.map(_obj => _obj.barcode)

    $units_switch.findMany({ 'company.id': objectAssemble.company.id, 'items.barcode': barcode }, (err, doc) => {
      doc.forEach(_doc => {
        if (_doc.items) _doc.items.forEach(_items => {
          if (objectAssemble.sizes_list) objectAssemble.sizes_list.forEach(_size => {
            if (_items.barcode == _size.barcode) {
              _items.size = _size.size
              _items.size_en = _size.size_en
            }
          })
        });
        $units_switch.update(_doc);
      });
    });
  });

  site.get({
    name: "units_switch",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  $units_switch.newCode = function () {

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

  site.post("/api/units_switch/add", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let units_switch_doc = req.body

    units_switch_doc.company = site.get_company(req)
    units_switch_doc.branch = site.get_branch(req)
    units_switch_doc.code = $units_switch.newCode();
    units_switch_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

    units_switch_doc.$req = req
    units_switch_doc.$res = res

    units_switch_doc.date = site.toDateTime(units_switch_doc.date)

    units_switch_doc.items.forEach(itm => {
      itm.current_count = site.toNumber(itm.current_count)
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })

    units_switch_doc.total_value = site.toNumber(units_switch_doc.total_value)
    units_switch_doc.net_value = site.toNumber(units_switch_doc.net_value)


    site.isAllowOverDraft(req, units_switch_doc.items, cbOverDraft => {

      if (!cbOverDraft.overdraft && cbOverDraft.value) {

        response.error = 'OverDraft Not Active'
        res.json(response)

      } else {


        $units_switch.add(units_switch_doc, (err, doc) => {

          if (!err) {

            response.done = true
            response.doc = doc

            if (doc.posting) {
              units_switch_doc.items.forEach((_isDoc, i) => {
                _isDoc.type = 'sum'
                _isDoc.store = units_switch_doc.store
                _isDoc.company = units_switch_doc.company
                _isDoc.branch = units_switch_doc.branch
                _isDoc.unit = _isDoc.Units_trans
                _isDoc.count = (_isDoc.unit.convert * _isDoc.count) / _isDoc.Units_trans.convert

                site.call('[transfer_branch][stores_items][add_balance]', Object.assign({}, _isDoc))

                _isDoc.code = units_switch_doc.code
                _isDoc.date = units_switch_doc.date
                _isDoc.source_type = units_switch_doc.type
                _isDoc.transaction_type = 'in'
                _isDoc.current_status = 'switchUnit'
                _isDoc.shift = {
                  id: units_switch_doc.shift.id,
                  code: units_switch_doc.shift.code,
                  name: units_switch_doc.shift.name
                }
                site.call('item_transaction + items', Object.assign({}, _isDoc))

              })

              doc.items.forEach((_itm, i) => {
                _itm.type = 'minus'
                _itm.store = doc.store
                _itm.company = doc.company
                _itm.branch = doc.branch

                site.call('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm))

                _itm.code = doc.code
                _itm.date = doc.date
                _itm.source_type = doc.type
                _itm.transaction_type = 'out'
                _itm.current_status = 'switchUnit'
                _itm.shift = {
                  id: doc.shift.id,
                  code: doc.shift.code,
                  name: doc.shift.name
                }

                site.call('item_transaction - items', Object.assign({}, _itm))

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

  site.post("/api/units_switch/update", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let units_switch_doc = req.body
    units_switch_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    units_switch_doc.vendor = site.fromJson(units_switch_doc.vendor)
    units_switch_doc.seasonName = units_switch_doc.seasonName
    units_switch_doc.type = site.fromJson(units_switch_doc.type)
    units_switch_doc.date = new Date(units_switch_doc.date)

    units_switch_doc.items.forEach(itm => {
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })

    units_switch_doc.total_value = site.toNumber(units_switch_doc.total_value)

    if (units_switch_doc._id) {
      $units_switch.edit({
        where: {
          _id: units_switch_doc._id
        },
        set: units_switch_doc,
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

  site.post("/api/units_switch/posting", (req, res) => {
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let response = {}
    response.done = false

    let units_switch_doc = req.body

    units_switch_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    if (units_switch_doc._id) {


      site.isAllowOverDraft(req, units_switch_doc.items, cbOverDraft => {

        if (!cbOverDraft.overdraft && cbOverDraft.value) {

          response.error = 'OverDraft Not Active'
          res.json(response)

        } else {


          $units_switch.edit({
            where: {
              _id: units_switch_doc._id
            },
            set: units_switch_doc,
            $req: req,
            $res: res
          }, (err, result) => {
            if (!err) {
              response.done = true
              response.doc = result.doc

              result.doc.items.forEach((_itm, i) => {
                if (result.doc.posting)
                  _itm.type = 'sum'
                else _itm.type = 'minus'

                _itm.store = result.doc.store
                _itm.company = result.doc.company
                _itm.branch = result.doc.branch


                _itm.code = result.doc.code
                _itm.date = result.doc.date
                _itm.source_type = result.doc.type
                _itm.transaction_type = 'in'
                if (result.doc.posting) {
                  _itm.current_status = 'switchUnit'
                } else {
                  _itm.count = (-Math.abs(_itm.count))
                  _itm.current_status = 'r_switchUnit'
                }

                _itm.shift = {
                  id: result.doc.shift.id,
                  code: result.doc.shift.code,
                  name: result.doc.shift.name
                }


                site.call('item_transaction + items', Object.assign({}, _itm))

                _itm.count = Math.abs(_itm.count)
                site.call('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm))

              })

            } else {
              response.error = err.message
            }
            res.json(response)
          })
        }
      })

    } else {
      res.json(response)
    }
  })

  site.post("/api/units_switch/delete", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let units_switch_doc = req.body
    if (units_switch_doc._id) {

      site.isAllowOverDraft(req, units_switch_doc.items, cbOverDraft => {

        if (!cbOverDraft.overdraft && cbOverDraft.value) {

          response.error = 'OverDraft Not Active'
          res.json(response)

        } else {


          $units_switch.delete({
            where: {
              _id: units_switch_doc._id
            },
            $req: req,
            $res: res
          }, (err, result) => {
            if (!err) {
              response.done = true
              if (units_switch_doc.posting) {

                result.doc.items.forEach((_itm, i) => {
                  _itm.type = 'minus'
                  _itm.store = result.doc.store
                  _itm.company = result.doc.company
                  _itm.branch = result.doc.branch
                  _itm.code = result.doc.code
                  _itm.date = result.doc.date
                  _itm.source_type = result.doc.type
                  _itm.transaction_type = 'in'
                  _itm.count = (-Math.abs(_itm.count))
                  _itm.current_status = 'd_switchUnit'
                  _itm.shift = {
                    id: result.doc.shift.id,
                    code: result.doc.shift.code,
                    name: result.doc.shift.name
                  }

                  site.call('item_transaction + items', Object.assign({}, _itm))

                  _itm.count = Math.abs(_itm.count)
                  site.call('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm))

                })

              }
              res.json(response)
            }
          })
        }
      })

    } else res.json(response)
  })

  site.post("/api/units_switch/view", (req, res) => {
    let response = {}
    response.done = false
    $units_switch.findOne({
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

  site.post("/api/units_switch/all", (req, res) => {
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
    $units_switch.findMany({
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


  site.post("/api/units_switch/un_post", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $units_switch.findMany({
      select: req.body.select || {},
      where: { 'company.id': site.get_company(req).id },
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docs) => {
      if (!err) {
        if (docs && docs.length > 0) {
          docs.forEach(units_switch_doc => {
            units_switch_doc.posting = false;
            $units_switch.update(units_switch_doc);
          });
        }
      }
      response.done = true
      res.json(response)
    })
  })

}