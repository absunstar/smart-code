module.exports = function init(site) {

  const $transfer_branch = site.connectCollection("transfer_branch")


  site.on('[stores_items][item_name][change]', objectStoreOut => {

    let barcode = objectStoreOut.sizes_list.map(_obj => _obj.barcode)

    $transfer_branch.findMany({ 'company.id': objectStoreOut.company.id, 'items.barcode': barcode }, (err, doc) => {
      doc.forEach(_doc => {
        if (_doc.items) _doc.items.forEach(_items => {
          if (objectStoreOut.sizes_list) objectStoreOut.sizes_list.forEach(_size => {
            if (_items.barcode === _size.barcode) {
              _items.size = _size.size
              _items.size_en = _size.size_en
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

  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  $transfer_branch.newCode = function () {

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
    branch_ransfer_doc.number = $transfer_branch.newCode();

    branch_ransfer_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

    branch_ransfer_doc.date = site.toDateTime(branch_ransfer_doc.date)

    branch_ransfer_doc.items.forEach(_itm => {
      _itm.current_count = site.toNumber(_itm.current_count)
      _itm.count = site.toNumber(_itm.count)
      _itm.cost = site.toNumber(_itm.cost)
      _itm.price = site.toNumber(_itm.price)
      _itm.total = site.toNumber(_itm.total)
    })

    $transfer_branch.add(branch_ransfer_doc, (err, doc) => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
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

    branch_ransfer_doc.date = new Date(branch_ransfer_doc.date)
    req.body.store = req.body.store_from;
    site.isAllowOverDraft(req, branch_ransfer_doc.items, cbOverDraft => {
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
                _itm.number = doc.number
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
                _itm.number = doc.number
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

    branch_ransfer_doc.date = new Date(branch_ransfer_doc.date)

    branch_ransfer_doc.items.forEach(itm => {
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
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
    if (_id) {
      $transfer_branch.delete({ _id: $transfer_branch.ObjectID(_id), $req: req, $res: res }, (err, result) => {
        if (!err) {
          response.done = true
          let Obj = {
            value: result.doc.net_value,
            safe: result.doc.safe,
            date: result.doc.date,
            number: result.doc.number,
            company: result.doc.company,
            branch: result.doc.branch,
            notes: result.doc.notes
          }

          result.doc.items.forEach(itm => {

            itm.number = result.doc.number
            itm.vendor = result.doc.vendor
            itm.date = result.doc.date
            itm.transaction_type = 'out'
            itm.current_status = 'transferred'
            itm.store = result.doc.store

            let delObj = {
              name: itm.name,
              size: itm.size,
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
  })

  site.post("/api/transfer_branch/view", (req, res) => {
    let response = {}
    response.done = false
    $transfer_branch.findOne({
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

  site.post("/api/transfer_branch/all", (req, res) => {
    let response = {}
    response.done = false
    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id

     where['$or'] = [{ 'branch_from.code': site.get_branch(req).code }, { 'branch_to.code': site.get_branch(req).code }]

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
    if (where && where['number']) {
      where['number'] = site.get_RegExp(where['number'], 'i')
    }

    if (where && where['supply_number']) {
      where['supply_number'] = site.get_RegExp(where['supply_number'], 'i')
    }

    if (where && where['items.ticket_code']) {
      where['items.ticket_code'] = site.get_RegExp(where['items.ticket_code'], 'i')
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

    $transfer_branch.findMany({
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
                  name: unit.name,
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
                  _itm.number = doc.number
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
                  _itm.number = doc.number
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

}