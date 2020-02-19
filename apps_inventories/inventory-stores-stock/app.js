module.exports = function init(site) {

  const $stores_stock = site.connectCollection("stores_stock")


  stock_itemName_list = []
  site.on('[stores_items][item_name][change]', obj => {
    stock_itemName_list.push(Object.assign({}, obj))
  })

  function stock_itemName_handle(obj) {
    if (obj == null) {
      if (stock_itemName_list.length > 0) {
        obj = stock_itemName_list[0]
        stock_itemName_handle(obj)
        stock_itemName_list.splice(0, 1)
      } else {
        setTimeout(() => {
          stock_itemName_handle(null)
        }, 1000);
      }
      return
    }

    let barcode = obj.sizes_list.map(_obj => _obj.barcode)
    let size = obj.sizes_list.map(_obj => _obj.size)

    $stores_stock.findMany({ 'company.id': obj.company.id, 'items.size': size, 'items.barcode': barcode }, (err, doc) => {
      doc.forEach(_doc => {
        if (_doc.items) _doc.items.forEach(_items => {
          if (obj.sizes_list) obj.sizes_list.forEach(_size => {
            if (_items.barcode == _size.barcode)
              _items.size = _size.size
          })
        });
        $stores_stock.update(_doc);
      });
      stock_itemName_handle(null)
    });
  };
  stock_itemName_handle(null)


  site.get({
    name: "stores_stock",
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

  $stores_stock.newCode = function () {

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

  site.post("/api/stores_stock/add", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      res.json(response)
      return;
    }

    let stores_stock_doc = req.body

    stores_stock_doc.company = site.get_company(req)
    stores_stock_doc.branch = site.get_branch(req)
    stores_stock_doc.code = $stores_stock.newCode();
    stores_stock_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

    stores_stock_doc.$req = req
    stores_stock_doc.$res = res

    stores_stock_doc.date = site.toDateTime(stores_stock_doc.date)

    // stores_stock_doc.items.forEach(itm => {
    //   itm.current_count = site.toNumber(itm.current_count)
    //   itm.count = site.toNumber(itm.count)
    //   itm.cost = site.toNumber(itm.cost)
    //   itm.price = site.toNumber(itm.price)
    //   itm.total = site.toNumber(itm.total)
    // })

    // stores_stock_doc.total_value = site.toNumber(stores_stock_doc.total_value)
    // stores_stock_doc.net_value = site.toNumber(stores_stock_doc.net_value)

    $stores_stock.add(stores_stock_doc, (err, doc) => {

      if (!err) {

        response.done = true
        response.doc = doc

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/stores_stock/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_stock_doc = req.body
    stores_stock_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    if (stores_stock_doc.status)
      // stores_stock_doc.vendor = site.fromJson(stores_stock_doc.vendor)
      // stores_stock_doc.seasonName = stores_stock_doc.seasonName
      // stores_stock_doc.type = site.fromJson(stores_stock_doc.type)
      // stores_stock_doc.date = new Date(stores_stock_doc.date)

      // stores_stock_doc.items.forEach(itm => {
      //   itm.count = site.toNumber(itm.count)
      //   itm.cost = site.toNumber(itm.cost)
      //   itm.price = site.toNumber(itm.price)
      //   itm.total = site.toNumber(itm.total)
      // })

      stores_stock_doc.total_value = site.toNumber(stores_stock_doc.total_value)

    if (stores_stock_doc._id) {
      $stores_stock.edit({
        where: {
          _id: stores_stock_doc._id
        },
        set: stores_stock_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          stock_doc = result.doc
          if (stock_doc.status == 1)
            site.call('holding items', Object.assign({}, stock_doc))

        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/stores_stock/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_stock_doc = req.body
    if (stores_stock_doc._id) {
      $stores_stock.delete({
        where: {
          _id: stores_stock_doc._id
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
  })

  site.post("/api/stores_stock/view", (req, res) => {
    let response = {}
    response.done = false
    $stores_stock.findOne({
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

  site.post("/api/stores_stock/all", (req, res) => {
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
    $stores_stock.findMany({
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