module.exports = function init(site) {

  const $stores_out = site.connectCollection("stores_out")

  $stores_out.deleteDuplicate({ number: 1 }, (err, result) => {
    $stores_out.createUnique({ number: 1 }, (err, result) => {

    })
  })

  $stores_out.busy1 = false
  site.on('[stores_items][store_out]', itm => {
    if ($stores_out.busy1 == true) {
      setTimeout(() => {
        site.call('[stores_items][store_out]', Object.assign({}, itm))
      }, 200);
      return
    }
    $stores_out.busy1 = true
    let obj = {
      items: [],
      total: 0,
      image_url: '/images/store_in.png',
      store: itm.store,
      vendor: itm.vendor,
      date: new Date(itm.date),
      number: site.toNumber(new Date().getTime().toString()),
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
        $stores_out.busy1 = false
      }
    })
  })

  site.get({
    name: "stores_out",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post({
    name: '/api/stores_out/types/all',
    path: __dirname + '/site_files/json/types.json'
  })


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

    stores_out_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

    stores_out_doc.date = site.toDateTime(stores_out_doc.date)

    stores_out_doc.items.forEach(itm => {
      itm.current_count = site.toNumber(itm.current_count)
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })

    stores_out_doc.discount = site.toNumber(stores_out_doc.discount)
    stores_out_doc.octazion = site.toNumber(stores_out_doc.octazion)
    stores_out_doc.net_discount = site.toNumber(stores_out_doc.net_discount)
    stores_out_doc.total_value = site.toNumber(stores_out_doc.total_value)
    stores_out_doc.net_value = site.toNumber(stores_out_doc.net_value)

    $stores_out.add(stores_out_doc, (err, doc) => {
      if (!err) {

        doc.items.forEach(itm => {
          itm.company = doc.company
          itm.branch = doc.branch
          site.call('[order_invoice][stores_items][-]', Object.assign({}, itm))

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

        if (obj.value && obj.safe && obj.date && obj.number) {

          site.call('[stores_out][safes][+]', obj)
        }

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

    stores_out_doc.seasonName = stores_out_doc.seasonName
    stores_out_doc.type = site.fromJson(stores_out_doc.type)
    stores_out_doc.date = new Date(stores_out_doc.date)

    stores_out_doc.items.forEach(itm => {
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })

    stores_out_doc.discount = site.toNumber(stores_out_doc.discount)
    stores_out_doc.octazion = site.toNumber(stores_out_doc.octazion)
    stores_out_doc.net_discount = site.toNumber(stores_out_doc.net_discount)
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

          result.doc.items.forEach(itm => {
            itm.company = result.doc.company
            itm.branch = result.doc.branch
            itm.vendor = result.doc.vendor
            itm.number = result.doc.number
            itm.current_status = 'storeout'
            itm.date = result.doc.date
            itm.transaction_type = 'in'
            itm.store = result.doc.store

            let delObj = {

              name: itm.name,
              date: result.doc.date,
              store: result.doc.store,
              vendor: result.doc.vendor,
              item: itm
            }
            site.call('[stores_out][stores_items][-]', delObj)
            site.call('please track item', Object.assign({ date: new Date() }, itm))
          })


          let Obj = {
            value: result.doc.net_value,
            safe: result.doc.safe,
            company: result.doc.company,
            branch: result.doc.branch,
            date: result.doc.date,
            number: result.doc.number,
            notes: result.doc.notes
          }
          if (Obj.value && Obj.safe && Obj.date && Obj.number) {
            site.call('[stores_out][safes][-]', Obj)
          }


          response.done = true
          result.doc.items.forEach(itm => {
            itm.store = result.doc.store


            //   site.call('please track item', Object.assign({date:new Date()}, itm))
            //  site.call('[store out] [categories items]' , itm)

          })

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

    if (where && where['notes']) {
      where['notes'] = new RegExp(where['notes'], 'i');
    }
    if (where && where['number']) {
      where['number'] = new RegExp(where['number'], 'i');
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
      where['shift.code'] = new RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }

    $stores_out.findMany({
      select: req.body.select || {},
      where: where,
      limit: req.body.limit,
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