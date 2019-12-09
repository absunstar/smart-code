module.exports = function init(site) {

  const $stores_out = site.connectCollection("stores_out")

  $stores_out.deleteDuplicate({ number: 1 }, (err, result) => {
    $stores_out.createUnique({ number: 1 }, (err, result) => {
    })
  })

  $stores_out.busy1 = false;
  site.on('[stores_items][store_out]', itm => {
    if ($stores_out.busy1 == true) {
      setTimeout(() => {
        site.call('[stores_items][store_out]', Object.assign({}, itm))
      }, 200);
      return
    }
    $stores_out.busy1 = true;
    let obj = {
      items: [],
      total: 0,
      image_url: '/images/store_out.png',
      store: itm.store,
      vendor: itm.vendor,
      date: new Date(itm.date),
      number: new Date().getTime().toString(),
      total_value: 0,
      net_value: 0,
      total_tax: 0,
      total_discount: 0,
      price: itm.price,
      cost: itm.cost,
    }
    obj.items.push(itm)

    $stores_out.add(obj, (err, doc) => {
      if (!err) {
        $stores_out.busy1 = false;
      }
    })

  })

  site.on('[stores_transfer][store_out][+]', doc => {
    doc.items.forEach(itm => {
      let obj = {
        items: [],
        total: 0,
        image_url: '/images/store_out.png',
        store: doc.store_to,
        vendor: doc.vendor,
        safe: doc.safe,
        date: new Date(doc.date),
        number: new Date().getTime().toString(),
        supply_number: doc.number,
        total_value: 0,
        net_value: 0,
        total_tax: 0,
        total_discount: 0,
        price: itm.price,
        cost: itm.cost,
        current_status: 'transferred'
      }
      obj.items.push(itm)
      $stores_out.add(obj, (err, doc) => {
        if (!err) {
          doc.items.forEach(itm => {

            delete itm.vendor
            delete itm.store
            itm.company = doc.company
            itm.branch = doc.branch
            itm.store = doc.store
            itm.vendor = doc.vendor
            itm.date = doc.date
            itm.transaction_type = 'in'
            itm.supply_number = doc.supply_number
            itm.current_status = ' '

            let nwitm = itm
            nwitm.current_status = 'transferred'
            let obj = {
              'itm.current_status': 'transferred',
              name: itm.name,
              vendor: doc.vendor,
              store: doc.store,
              date: doc.date,
              item: nwitm,
            }

            site.call('[stores_transfer][stores_items]', obj)
            site.call('please track item', Object.assign({}, itm))

          });
        }
      })
    });
  })

  site.on('[eng_item_debt][stores_out][+]', itm => {

    let sizes = [{
      name: itm.name,
      count: 1,
      total: 0,
      total_value: itm.price,
      net_value: itm.price,
      size: itm.size,
      price: itm.price,
      name: itm.name
    }]

    let obj = {
      date: itm.date,
      image_url: '/images/store_out.png',
      items: sizes,
      store: itm.store,
      vendor: itm.vendor,
      date: new Date(itm.date),
      number: new Date().getTime().toString(),
      total_value: 0,
      net_value: 0,
      total_tax: 0,
      total_discount: 0,
      count: itm.count
    }
    $stores_out.add(obj)
  })

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

    stores_out_doc.discount = site.toNumber(stores_out_doc.discount)
    stores_out_doc.octazion = site.toNumber(stores_out_doc.octazion)
    stores_out_doc.net_discount = site.toNumber(stores_out_doc.net_discount)
    stores_out_doc.total_value = site.toNumber(stores_out_doc.total_value)
    stores_out_doc.net_value = site.toNumber(stores_out_doc.net_value)

    $stores_out.add(stores_out_doc, (err, doc) => {
      if (!err) {

        doc.items.forEach(_itm => {
          _itm.status_store_in = doc.type
          _itm.store = doc.store
          _itm.company = doc.company
          _itm.branch = doc.branch
          site.call('[store_out][stores_items][-]', Object.assign({}, _itm))          
        });

        response.done = true

        let obj = {
          value: doc.net_value,
          safe: doc.safe,
          date: doc.date,
          number: doc.number,
          company: doc.company,
          branch: doc.branch,
          notes: doc.notes
        }

        if (obj.value && obj.safe && obj.date && obj.number) 
          site.call('[stores_out][safes][+]', obj)

        stores_out_doc.items.forEach(itm => {
          itm.company = stores_out_doc.company
          itm.branch = stores_out_doc.branch
          itm.vendor = stores_out_doc.vendor
          itm.number = stores_out_doc.number
          itm.current_status = 'sold'
          itm.date = stores_out_doc.date
          itm.transaction_type = 'out'
          itm.store = stores_out_doc.store
          site.call('please out item', Object.assign({}, itm))
        })
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

    stores_out_doc.vendor = site.fromJson(stores_out_doc.vendor)
    stores_out_doc.seasonName = stores_out_doc.seasonName
    stores_out_doc.type = site.fromJson(stores_out_doc.type)
    stores_out_doc.date = new Date(stores_out_doc.date)

    stores_out_doc.items.forEach(itm => {
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })

    // stores_out_doc.octazion = site.toNumber(stores_out_doc.octazion)
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

  site.post("/api/stores_out/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let _id = req.body._id
    if (_id) {
      $stores_out.delete({ _id: $stores_out.ObjectID(_id), $req: req, $res: res }, (err, result) => {
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
          if (Obj.value && Obj.safe && Obj.date && Obj.number) {
            site.call('[stores_out][safes][+]', Obj)
          }

          result.doc.items.forEach(itm => {

            itm.number = result.doc.number
            itm.vendor = result.doc.vendor
            itm.date = result.doc.date
            itm.transaction_type = 'out'
            itm.current_status = 'storeout'
            itm.store = result.doc.store

            let delObj = {
              name: itm.name,
              size: itm.size,
              store: result.doc.store,
              vendor: result.doc.vendor,
              item: itm
            }

            site.call('[stores_out][stores_items][-]', delObj)
            site.call('please out item', Object.assign({ date: new Date() }, itm))

          });

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

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
        
    if (where['shift_code']) {
      where['shift.code'] = new RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }

    if (where && where['notes']) {
      where['notes'] = new RegExp(where['notes'], 'i')
    }
    if (where && where['number']) {
      where['number'] = new RegExp(where['number'], 'i')
    }

    if (where && where['supply_number']) {
      where['supply_number'] = new RegExp(where['supply_number'], 'i')
    }

    if (where && where['items.ticket_code']) {
      where['items.ticket_code'] = new RegExp(where['items.ticket_code'], 'i')
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

}