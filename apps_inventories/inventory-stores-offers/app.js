module.exports = function init(site) {

  const $stores_offer = site.connectCollection("stores_offer")

  site.on('[stores_items][item_name][change]', objectStock => {

    let barcode = objectStock.sizes_list.map(_obj => _obj.barcode)

    $stores_offer.findMany({ 'company.id': objectStock.company.id, 'items.barcode': barcode }, (err, doc) => {
      doc.forEach(_doc => {
        if (_doc.items) _doc.items.forEach(_items => {
          if (objectStock.sizes_list) objectStock.sizes_list.forEach(_size => {
            if (_items.barcode == _size.barcode) {
              _items.size_ar = _size.size_ar
              _items.size_en = _size.size_en
              _items.name_ar = _size.name_ar
              _items.name_en = _size.name_en
            }
          })
        });
        $stores_offer.update(_doc);
      });
    });
  });


  site.get({
    name: "stores_offer",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/stores_offer/add", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let stores_offer_doc = req.body

    stores_offer_doc.company = site.get_company(req)
    stores_offer_doc.branch = site.get_branch(req)

    site.getOpenShift({ companyId: stores_offer_doc.company.id, branchCode: stores_offer_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {

            stores_offer_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

            stores_offer_doc.$req = req
            stores_offer_doc.$res = res

            if (stores_offer_doc.items && stores_offer_doc.items.length > 0)
              stores_offer_doc.items.forEach(_item => {
                if (_item.size_units_list && _item.size_units_list.length > 0)
                  _item.size_units_list.forEach(_itmUnit => {
                    _itmUnit.discount.max = _itmUnit.discount.value
                  });
              });

            let num_obj = {
              company: site.get_company(req),
              screen: 'items_offers',
              date: new Date()
            };

            let cb = site.getNumbering(num_obj);
            if (!stores_offer_doc.code && !cb.auto) {
              response.error = 'Must Enter Code';
              res.json(response);
              return;

            } else if (cb.auto) {
              stores_offer_doc.code = cb.code;
            }

            $stores_offer.add(stores_offer_doc, (err, doc) => {

              if (!err) {
                response.done = true
                response.doc = doc
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

  site.post("/api/stores_offer/update", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let stores_offer_doc = req.body
    stores_offer_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    site.getOpenShift({ companyId: stores_offer_doc.company.id, branchCode: stores_offer_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {


            if (stores_offer_doc.items && stores_offer_doc.items.length > 0)
              stores_offer_doc.items.forEach(_item => {
                if (_item.size_units_list && _item.size_units_list.length > 0)
                  _item.size_units_list.forEach(_itmUnit => {
                    _itmUnit.discount.max = _itmUnit.discount.value
                  });
              });

            if (stores_offer_doc._id) {
              $stores_offer.edit({
                where: {
                  _id: stores_offer_doc._id
                },
                set: stores_offer_doc,
                $req: req,
                $res: res
              }, (err, result) => {
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

  site.post("/api/stores_offer/delete", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let stores_offer_doc = req.body

    site.getOpenShift({ companyId: stores_offer_doc.company.id, branchCode: stores_offer_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {


            if (stores_offer_doc._id) {
              $stores_offer.delete({
                where: {
                  _id: stores_offer_doc._id
                },
                $req: req,
                $res: res
              }, (err, result) => {
                if (!err) {
                  response.done = true
                  res.json(response)
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

  site.post("/api/stores_offer/view", (req, res) => {
    let response = {}
    response.done = false
    $stores_offer.findOne({
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


  site.post("/api/stores_offer/all", (req, res) => {
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

    if (where.dateTo) {
      let d1 = site.toDate(where.dateFrom)
      let d2 = site.toDate(where.dateFrom)
      d2.setDate(d2.getDate() + 1)
      where.startup_date = {
        '$gte': d1,
        '$lt': d2
      }

    } else if (where && where.dateTo) {
      let d1 = site.toDate(where.dateFrom)
      let d2 = site.toDate(where.dateTo)
      d2.setDate(d2.getDate() + 1);
      where.deadline_date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.dateFrom
      delete where.dateTo

    } else if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setTime(d2.getTime() + (500 * 24 * 60 * 60 * 1000));
      where.deadline_date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date

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
      where['description'] = site.get_RegExp(where['description'], 'i')
    }

    delete where.search
    $stores_offer.findMany({
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

  site.post("/api/stores_offer/offer_active", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.body.where || {}

    let barcode = where['barcode']

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.startup_date = {
        '$lt': d2
      }

      where.deadline_date = {
        '$gte': d1,
      }
      delete where['date']

    }

    if (where['barcode']) {
      where['items.barcode'] = where['barcode']
      delete where['barcode']
    }

    where['active'] = true


    $stores_offer.findOne({
      where: where,
      sort: { id: -1 }
    }, (err, doc) => {
      if (!err && doc) {

        response.done = true
        let item = {}
        doc.items.forEach(_itm => {

          if (_itm.barcode == barcode) item = _itm
        });

        response.doc = item
      } else {
        response.error = err
      }
      res.json(response)
    })
  })

}