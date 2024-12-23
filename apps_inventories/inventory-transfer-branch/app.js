module.exports = function init(site) {

  const $transfer_branch = site.connectCollection("transfer_branch")

  site.on('[stores_items][item_name][change]', objectStoreOut => {

    let barcode = objectStoreOut.sizes_list.map(_obj => _obj.barcode)

    $transfer_branch.findMany({ 'company.id': objectStoreOut.company.id, 'items.barcode': barcode }, (err, doc) => {
      doc.forEach(_doc => {
        if (_doc.items) _doc.items.forEach(_items => {
          if (objectStoreOut.sizes_list) objectStoreOut.sizes_list.forEach(_size => {
            if (_items.barcode === _size.barcode) {
              _items.size_Ar = _size.size_ar
              _items.size_En= _size.size_en
              _items.name_Ar = _size.name_Ar
              _items.name_En = _size.name_En
            }
          })
        });
        $transfer_branch.update(_doc);
      });
    });
  })


  site.get({
    name: "transfer_branch",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/transfer_branch/add", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let branch_ransfer_doc = req.body

    branch_ransfer_doc.$req = req
    branch_ransfer_doc.$res = res
    branch_ransfer_doc.company = site.get_company(req)
    branch_ransfer_doc.branch = site.get_branch(req)

    site.getOpenShift({ companyId: branch_ransfer_doc.company.id, branchCode: branch_ransfer_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {

            branch_ransfer_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

            branch_ransfer_doc.date = site.toDateTime(branch_ransfer_doc.date)

            branch_ransfer_doc.items.forEach(_itm => {
              _itm.current_count = site.toNumber(_itm.current_count)
              _itm.count = site.toNumber(_itm.count)
              _itm.cost = site.toNumber(_itm.cost)
              _itm.price = site.toNumber(_itm.price)
              _itm.total = site.toNumber(_itm.total)

              if (_itm.patch_list && _itm.patch_list.length > 0) {
                let filter_patch = _itm.patch_list.filter(_p => _p.count !== 0)
                _itm.patch_list = filter_patch
              }
            })

            let num_obj = {
              company: site.get_company(req),
              screen: 'transfer_items',
              date: new Date(branch_ransfer_doc.date)
            };

            let cb = site.getNumbering(num_obj);
            if (!branch_ransfer_doc.code && !cb.auto) {
              response.error = 'Must Enter Code';
              res.json(response);
              return;

            } else if (cb.auto) {
              branch_ransfer_doc.code = cb.code;
            }


            $transfer_branch.add(branch_ransfer_doc, (err, doc) => {
              if (!err) {
                response.done = true
              } else {
                response.error = err.message
              }
              res.json(response)
            })
          }
        })
      } else {
        response.error = 'Don`t Found Open Shift'
        res.json(response)
      }
    })
  })

  site.post("/api/transfer_branch/confirm", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let branch_ransfer_doc = req.body
    branch_ransfer_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    site.getOpenShift({ companyId: branch_ransfer_doc.company.id, branchCode: branch_ransfer_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {


            branch_ransfer_doc.date = new Date(branch_ransfer_doc.date)
            req.body.store = req.body.store_from;
            site.isAllowOverDraft(req, req.body.items, cbOverDraft => {
              response.overObj = cbOverDraft.overObj

              if (!cbOverDraft.overdraft && cbOverDraft.value) {

                response.error = 'OverDraft Not Active'
                res.json(response)

              } else {

                if (branch_ransfer_doc._id) {
                  $transfer_branch.edit({
                    where: {
                      _id: branch_ransfer_doc._id
                    },
                    set: branch_ransfer_doc,
                    $req: req,
                    $res: res
                  }, (err, document) => {
                    if (!err) {
                      response.done = true
                      let doc = document.doc
                      doc.items.forEach((_itm, i) => {
                        _itm.company = doc.company
                        _itm.branch = doc.branch_from
                        _itm.code = doc.code
                        _itm.current_status = 'transferred'
                        _itm.date = doc.date
                        _itm.transaction_type = 'out'
                        _itm.store = doc.store_from
                        site.quee('item_transaction - items', Object.assign({}, _itm))
                        _itm.type = 'minus'
                        site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm))

                      })

                      doc.items.forEach((_itm, i) => {
                        _itm.company = doc.company
                        _itm.branch = doc.branch_to
                        _itm.code = doc.code
                        _itm.current_status = 'transferred'
                        _itm.date = doc.date
                        _itm.transaction_type = 'in'
                        _itm.store = doc.store_to
                        site.quee('item_transaction + items', Object.assign({}, _itm))
                        _itm.type = 'sum'
                        site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm))
                      })

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
          }
        })
      } else {
        response.error = 'Don`t Found Open Shift'
        res.json(response)
      }
    })
  })

  site.post("/api/transfer_branch/update", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let branch_ransfer_doc = req.body
    branch_ransfer_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    site.getOpenShift({ companyId: branch_ransfer_doc.company.id, branchCode: branch_ransfer_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {


            branch_ransfer_doc.date = new Date(branch_ransfer_doc.date)

            branch_ransfer_doc.items.forEach(_itm => {
              _itm.count = site.toNumber(_itm.count)
              _itm.cost = site.toNumber(_itm.cost)
              _itm.price = site.toNumber(_itm.price)
              _itm.total = site.toNumber(_itm.total)

              if (_itm.patch_list && _itm.patch_list.length > 0) {
                let filter_patch = _itm.patch_list.filter(_p => _p.count !== 0)
                _itm.patch_list = filter_patch
              }
            })



            if (branch_ransfer_doc._id) {
              $transfer_branch.edit({
                where: {
                  _id: branch_ransfer_doc._id
                },
                set: branch_ransfer_doc,
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

  site.post("/api/transfer_branch/delete", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let _id = req.body._id

    site.getOpenShift({ companyId: req.body.company.id, branchCode: req.body.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {


            if (_id) {
              $transfer_branch.delete({ _id: $transfer_branch.ObjectId(_id), $req: req, $res: res }, (err, result) => {
                if (!err) {
                  response.done = true
                  let Obj = {
                    value: result.doc.net_value,
                    safe: result.doc.safe,
                    date: result.doc.date,
                    code: result.doc.code,
                    company: result.doc.company,
                    branch: result.doc.branch,
                    notes: result.doc.notes
                  }

                  result.doc.items.forEach(itm => {

                    itm.code = result.doc.code
                    itm.vendor = result.doc.vendor
                    itm.date = result.doc.date
                    itm.transaction_type = 'out'
                    itm.current_status = 'transferred'
                    itm.store = result.doc.store

                    let delObj = {
                      name: itm.name,
                      size_Ar: itm.size_Ar,
                      store: result.doc.store,
                      vendor: result.doc.vendor,
                      item: itm
                    }

                    site.call('[transfer_branch][stores_items][+]', delObj)
                    site.quee('item_transaction - items', Object.assign({ date: new Date() }, itm))

                  });

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

  site.post("/api/transfer_branch/view", (req, res) => {
    let response = {}
    response.done = false
    $transfer_branch.findOne({
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

  site.post("/api/transfer_branch/all", (req, res) => {
    let response = {}
    response.done = false
    let where = req.body.where || {}
    let limit = where.limit || undefined

    where['company.id'] = site.get_company(req).id

    if (where['branchAll']) {
      delete where['branchAll']
    } else {
      where['$or'] = [{ 'branch_from.code': site.get_branch(req).code }, { 'branch_to.code': site.get_branch(req).code }]
    }


    if (where['branch_from']) {
      where['branch_from.id'] = where['branch_from'].id;
      delete where['branch_from']
    }

    if (where['branch_to']) {
      where['branch_to.id'] = where['branch_to'].id;
      delete where['branch_to']
    }

    if (where['store_from']) {
      where['store_from.id'] = where['store_from'].id;
      delete where['store_from']
    }

    if (where['store_to']) {
      where['store_to.id'] = where['store_to'].id;
      delete where['store_to']
    }

    if (where['shift_code']) {
      where['shift.code'] = site.get_RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }

    if (where && where['notes']) {
      where['notes'] = site.get_RegExp(where['notes'], 'i')
    }
    if (where && where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    }

    if (where && where['supply_number']) {
      where['supply_number'] = site.get_RegExp(where['supply_number'], 'i')
    }

    if (where && where['items.ticket_code']) {
      where['items.ticket_code'] = site.get_RegExp(where['items.ticket_code'], 'i')
    }

    if (where && where['limit']) {
      delete where['limit']
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

    if (where['size_ar']) {
      where['items.size_ar'] = site.get_RegExp(where['size_ar'], 'i')
      delete where['size_ar']
    }

    if (where['size_En']) {
      where['items.size_En'] = site.get_RegExp(where['size_En'], 'i')
      delete where['size_En']
    }

    if (where['barcode']) {
      where['items.barcode'] = where['barcode']
      delete where['barcode']
    }

    if (where['confirmed']) {
      where['transfer'] = true
      delete where['confirmed']

    }
    if (where['un_confirmed']) {
      where['$or'] = [{ 'transfer': false }, { 'transfer': undefined }]
      delete where['un_confirmed']
    }


    $transfer_branch.findMany({
      select: req.body.select || {},
      limit: limit,
      where: where,
      sort: { id: -1 }
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.list = docs
        response.count = docs.length

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.post("/api/transfer_branch/un_confirm", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    $transfer_branch.findMany({
      select: req.body.select || {},
      where: { 'company.id': site.get_company(req).id },
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docs) => {
      if (!err) {
        docs.forEach(transfer_branch_doc => {
          transfer_branch_doc.transfer = false;
          $transfer_branch.update(transfer_branch_doc);
        });
      }
      response.done = true
      res.json(response)
    })
  })

  site.post("/api/transfer_branch/handel_transfer_branch", (req, res) => {
    let response = {
      done: false
    }
    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id

    $transfer_branch.findMany({
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
              _doc.items.forEach(_item => {
                _item.unit = {
                  id: unit.id,
                  name_Ar: unit.name_Ar, name_En: unit.name_En,
                  convert: 1
                }
              });
              $transfer_branch.update(_doc)
            });
        })
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.post("/api/transfer_branch/confirm_all", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $transfer_branch.findMany({
      select: req.body.select || {},
      where: { 'company.id': site.get_company(req).id },
    }, (err, docs) => {

      if (!err) {

        docs.forEach(transfer_branch_doc => {
          transfer_branch_doc.transfer = true

          if (transfer_branch_doc._id) {
            $transfer_branch.edit({
              where: {
                _id: transfer_branch_doc._id
              },
              set: transfer_branch_doc,
              $req: req,
              $res: res
            }, (err, document) => {
              if (!err) {
                response.done = true
                let doc = document.doc
                doc.items.forEach((_itm, i) => {
                  _itm.company = doc.company
                  _itm.branch = doc.branch_from
                  _itm.code = doc.code
                  _itm.current_status = 'transferred'
                  _itm.date = doc.date
                  _itm.transaction_type = 'out'
                  _itm.store = doc.store_from
                  site.quee('item_transaction - items', Object.assign({}, _itm))
                  _itm.type = 'minus'
                  site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm))

                })

                doc.items.forEach((_itm, i) => {
                  _itm.company = doc.company
                  _itm.branch = doc.branch_to
                  _itm.code = doc.code
                  _itm.current_status = 'transferred'
                  _itm.date = doc.date
                  _itm.transaction_type = 'in'
                  _itm.store = doc.store_to
                  site.quee('item_transaction + items', Object.assign({}, _itm))
                  _itm.type = 'sum'
                  site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm))
                })

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


  site.getTransferBranch = function (whereObj, callback) {
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
    where['transfer'] = true

    $transfer_branch.findMany({
      where: where,
      sort: { id: -1 }

    }, (err, docs) => {
      if (!err && docs)
        callback(docs)
      else callback(false)
    })
  }

}