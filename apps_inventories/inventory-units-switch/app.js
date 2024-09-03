module.exports = function init(site) {

  const $units_switch = site.connectCollection("units_switch")


  site.on('[stores_items][item_name][change]', objectAssemble => {

    let barcode = objectAssemble.sizes_list.map(_obj => _obj.barcode)

    $units_switch.findMany({ 'company.id': objectAssemble.company.id, 'items.barcode': barcode }, (err, doc) => {
      doc.forEach(_doc => {
        if (_doc.items) _doc.items.forEach(_items => {
          if (objectAssemble.sizes_list) objectAssemble.sizes_list.forEach(_size => {
            if (_items.barcode == _size.barcode) {
              _items.size_ar = _size.size_ar
              _items.size_en = _size.size_en
              _items.name_ar = _size.name_ar
              _items.name_en = _size.name_en
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

    site.getOpenShift({ companyId: units_switch_doc.company.id, branchCode: units_switch_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {



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

            site.isAllowOverDraft(req, req.body.items, cbOverDraft => {

              if (!cbOverDraft.overdraft && cbOverDraft.value) {

                response.error = 'OverDraft Not Active'
                res.json(response)

              } else {

                let num_obj = {
                  company: site.get_company(req),
                  screen: 'units_Switch',
                  date: new Date(units_switch_doc.date)
                };

                let cb = site.getNumbering(num_obj);
                if (!units_switch_doc.code && !cb.auto) {
                  response.error = 'Must Enter Code';
                  res.json(response);
                  return;

                } else if (cb.auto) {
                  units_switch_doc.code = cb.code;
                }

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
                        _isDoc.unit = _isDoc.units_trans
                        _isDoc.patch_list = _isDoc.patch_trans_list
                        _isDoc.count = _isDoc.count_trans
                        _isDoc.count = site.toNumber(_isDoc.count)

                        site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _isDoc))

                        _isDoc.code = units_switch_doc.code
                        _isDoc.date = units_switch_doc.date
                        _isDoc.source_type = units_switch_doc.type
                        _isDoc.transaction_type = 'in'
                        _isDoc.current_status = 'switchUnit'
                        _isDoc.shift = {
                          id: units_switch_doc.shift.id,
                          code: units_switch_doc.shift.code,
                          name_ar: units_switch_doc.shift.name_ar, name_en: units_switch_doc.shift.name_en
                        }

                        site.quee('item_transaction + items', Object.assign({}, _isDoc))
                      })

                      doc.items.forEach((_isDoc2, i) => {
                        _isDoc2.type = 'minus'
                        _isDoc2.store = doc.store
                        _isDoc2.company = doc.company
                        _isDoc2.branch = doc.branch

                        site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _isDoc2))

                        _isDoc2.code = doc.code
                        _isDoc2.date = doc.date
                        _isDoc2.source_type = doc.type
                        _isDoc2.transaction_type = 'out'
                        _isDoc2.current_status = 'switchUnit'
                        _isDoc2.shift = {
                          id: doc.shift.id,
                          code: doc.shift.code,
                          name_ar: doc.shift.name_ar, name_en: doc.shift.name_en
                        }

                        site.quee('item_transaction - items', Object.assign({}, _isDoc2))
                      })
                    }

                  } else {
                    response.error = err.message
                  }
                  res.json(response)
                })
              }
            })
          }
        })
      } else {
        response.error = 'Don`t Found Open Shift'
        res.json(response)
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

    site.getOpenShift({ companyId: units_switch_doc.company.id, branchCode: units_switch_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {


            units_switch_doc.vendor = site.fromJson(units_switch_doc.vendor)
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
          }
        })
      } else {
        response.error = 'Don`t Found Open Shift'
        res.json(response)
      }
    })
  })

  site.post("/api/units_switch/posting", (req, res) => {
    let response = {}

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    response.done = false

    let units_switch_doc = req.body

    units_switch_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    site.getOpenShift({ companyId: units_switch_doc.company.id, branchCode: units_switch_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {


            if (units_switch_doc._id) {

              site.isAllowOverDraft(req, req.body.items, cbOverDraft => {

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

                      units_switch_doc.items.forEach((_isDoc, i) => {

                        _isDoc.transaction_type = 'in'
                        _isDoc.store = units_switch_doc.store
                        _isDoc.company = units_switch_doc.company
                        _isDoc.branch = units_switch_doc.branch
                        _isDoc.unit = _isDoc.units_trans
                        _isDoc.patch_list = _isDoc.patch_trans_list
                        _isDoc.count = _isDoc.count_trans
                        _isDoc.count = site.toNumber(_isDoc.count)

                        if (units_switch_doc.posting) {

                          _isDoc.type = 'sum'
                          _isDoc.current_status = 'switchUnit'
                        } else {

                          _isDoc.type = 'minus'
                          _isDoc.current_status = 'r_switchUnit'
                          _isDoc.count = (-Math.abs(_isDoc.count))

                        }

                        _isDoc.code = units_switch_doc.code
                        _isDoc.date = units_switch_doc.date
                        _isDoc.source_type = units_switch_doc.type

                        _isDoc.shift = {
                          id: units_switch_doc.shift.id,
                          code: units_switch_doc.shift.code,
                          name_ar: units_switch_doc.shift.name_ar, name_en: units_switch_doc.shift.name_en
                        }
                        site.quee('item_transaction + items', Object.assign({}, _isDoc))

                        _isDoc.count = Math.abs(_isDoc.count)

                        site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _isDoc))

                      })


                      result.doc.items.forEach((_isDoc2, i) => {
                        _isDoc2.count = site.toNumber(_isDoc2.count)

                        if (units_switch_doc.posting) {

                          _isDoc2.type = 'minus'
                          _isDoc2.current_status = 'switchUnit'
                        } else {

                          _isDoc2.type = 'sum'
                          _isDoc2.current_status = 'r_switchUnit'
                          _isDoc2.count = (-Math.abs(_isDoc2.count))
                        }

                        _isDoc2.transaction_type = 'out'
                        _isDoc2.store = result.doc.store
                        _isDoc2.company = result.doc.company
                        _isDoc2.branch = result.doc.branch


                        _isDoc2.code = result.doc.code
                        _isDoc2.date = result.doc.date
                        _isDoc2.source_type = result.doc.type

                        _isDoc2.shift = {
                          id: result.doc.shift.id,
                          code: result.doc.shift.code,
                          name_ar: result.doc.shift.name_ar, name_en: result.doc.shift.name_en
                        }

                        site.quee('item_transaction - items', Object.assign({}, _isDoc2))

                        _isDoc2.count = Math.abs(_isDoc2.count)

                        site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _isDoc2))

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
          }
        })
      } else {
        response.error = 'Don`t Found Open Shift'
        res.json(response)
      }
    })
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

    site.getOpenShift({ companyId: units_switch_doc.company.id, branchCode: units_switch_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {


            if (units_switch_doc._id) {

              site.isAllowOverDraft(req, req.body.items, cbOverDraft => {

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
                    if (!err && result) {
                      response.done = true

                      if (result.doc.posting) {
                        units_switch_doc.items.forEach((_isDoc, i) => {
                          _isDoc.type = 'minus'
                          _isDoc.store = units_switch_doc.store
                          _isDoc.company = units_switch_doc.company
                          _isDoc.branch = units_switch_doc.branch
                          _isDoc.unit = _isDoc.units_trans
                          _isDoc.patch_list = _isDoc.patch_trans_list
                          _isDoc.count = _isDoc.count_trans

                          site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _isDoc))

                          _isDoc.code = units_switch_doc.code
                          _isDoc.date = units_switch_doc.date
                          _isDoc.source_type = units_switch_doc.type
                          _isDoc.transaction_type = 'out'
                          _isDoc.current_status = 'd_switchUnit'
                          _isDoc.shift = {
                            id: units_switch_doc.shift.id,
                            code: units_switch_doc.shift.code,
                            name_ar: units_switch_doc.shift.name_ar, name_en: units_switch_doc.shift.name_en
                          }
                          site.quee('item_transaction - items', Object.assign({}, _isDoc))

                        })

                        result.doc.items.forEach((_isDoc2, i) => {
                          _isDoc2.type = 'sum'
                          _isDoc2.store = result.doc.store
                          _isDoc2.company = result.doc.company
                          _isDoc2.branch = result.doc.branch

                          site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _isDoc2))

                          _isDoc2.code = result.doc.code
                          _isDoc2.date = result.doc.date
                          _isDoc2.source_type = result.doc.type
                          _isDoc2.transaction_type = 'in'
                          _isDoc2.current_status = 'd_switchUnit'
                          _isDoc2.shift = {
                            id: result.doc.shift.id,
                            code: result.doc.shift.code,
                            name_ar: result.doc.shift.name_ar, name_en: result.doc.shift.name_en
                          }

                          site.quee('item_transaction + items', Object.assign({}, _isDoc2))

                        })


                      }

                      res.json(response)
                    }
                  })
                }
              })

            } else res.json(response)

          }
        })
      } else {
        response.error = 'Don`t Found Open Shift'
        res.json(response)
      }
    })
  })

  site.post("/api/units_switch/view", (req, res) => {
    let response = {}
    response.done = false
    $units_switch.findOne({
      where: {
        _id: site.mongodb.ObjectId(req.body._id)
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

    if (where && where['code']) {
      where['code'] = where['code']
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

    if (where['post']) {
      where['posting'] = true
      delete where['post']

    }
    if (where['un_post']) {
      where['$or'] = [{ 'posting': false }, { 'posting': undefined }]
      delete where['un_post']
    }

    if (where['description']) {
      where['description'] = site.get_RegExp(where['description'], 'i')
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


  site.getUnitSwitch = function (whereObj, callback) {
    callback = callback || {};
    let where = whereObj || {}

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
    where['posting'] = true

    $units_switch.findMany({
      where: where,
      sort: { id: -1 }

    }, (err, doc) => {
      if (!err && doc)
        callback(doc)
      else callback(false)
    })
  }

}