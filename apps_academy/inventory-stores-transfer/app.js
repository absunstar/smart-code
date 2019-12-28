module.exports = function init(site) {

  const $stores_transfer = site.connectCollection("stores_transfer")
 
  $stores_transfer.deleteDuplicate( {number : 1 } , (err , result)=>{
    $stores_transfer.createUnique({number : 1 } , (err , result)=>{

    })
  })


  site.get({
    name: "stores_transfer",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })
  site.post({
    name: '/api/stores_transfer/types/all',
    path: __dirname + '/site_files/json/types.json'
  })


  site.post("/api/stores_transfer/add", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_transfer_doc = req.body
    stores_transfer_doc.$req = req
    stores_transfer_doc.$res = res

    stores_transfer_doc._created = site.security.getUserFinger({$req : req , $res : res})

    stores_transfer_doc.date = site.toDateTime(stores_transfer_doc.date)

    stores_transfer_doc.items.forEach(itm => {
      itm.current_count = site.toNumber(itm.current_count)
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })


    stores_transfer_doc.academy = site.get_company(req)
    stores_transfer_doc.branch = site.get_branch(req)

    stores_transfer_doc.discount = site.toNumber(stores_transfer_doc.discount)
    stores_transfer_doc.octazion = site.toNumber(stores_transfer_doc.octazion)
    stores_transfer_doc.net_discount = site.toNumber(stores_transfer_doc.net_discount)
    stores_transfer_doc.total_value = site.toNumber(stores_transfer_doc.total_value)
    stores_transfer_doc.net_value = site.toNumber(stores_transfer_doc.net_value)

    $stores_transfer.add(stores_transfer_doc, (err, doc) => {
      if (!err) {
        doc.items.forEach(itm => {
         
          itm.store = doc.store
          itm.vendor = doc.vendor
          let obj = {
            academy : itm.academy,
            branch : itm.branch,
            name: itm.name,
            vendor : doc.vendor,
            store : doc.store,
            date : doc.date,
            item : itm
          }
         
          site.call('[stores_transfer][stores_items][+]' , obj)
          
        });

        response.done = true

        stores_transfer_doc.items.forEach(itm => {
          itm.vendor = stores_transfer_doc.vendor
          itm.academy = stores_transfer_doc.academy,
           itm. branch = stores_transfer_doc.branch,
          itm.number =  stores_transfer_doc.number
          itm.current_status = 'transferred'
          itm.date = stores_transfer_doc.date
          itm.transaction_type ='out'
          itm.supply_number = stores_transfer_doc.number
          itm.store = stores_transfer_doc.store
          site.call('item_transaction - items', Object.assign( {} , itm))
          
        })
        setTimeout(() => {
          site.call('[stores_transfer][store_in][+]', doc)
        }, 200);
      
      }else{
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/stores_transfer/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_transfer_doc = req.body
    stores_transfer_doc._updated = site.security.getUserFinger({$req : req , $res : res})

    stores_transfer_doc.seasonName = stores_transfer_doc.seasonName
    stores_transfer_doc.type = site.fromJson(stores_transfer_doc.type)
    stores_transfer_doc.date = new Date(stores_transfer_doc.date)

    stores_transfer_doc.items.forEach(itm => {
      itm.count = site.toNumber(itm.count)
      itm.cost = site.toNumber(itm.cost)
      itm.price = site.toNumber(itm.price)
      itm.total = site.toNumber(itm.total)
    })

    stores_transfer_doc.discount = site.toNumber(stores_transfer_doc.discount)
    stores_transfer_doc.octazion = site.toNumber(stores_transfer_doc.octazion)
    stores_transfer_doc.net_discount = site.toNumber(stores_transfer_doc.net_discount)
    stores_transfer_doc.total_value = site.toNumber(stores_transfer_doc.total_value)

    if (stores_transfer_doc._id) {
      $stores_transfer.edit({
        where: {
          _id: stores_transfer_doc._id
        },
        set: stores_transfer_doc,
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

  site.post("/api/stores_transfer/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let _id = req.body._id
    if (_id) {
      $stores_transfer.delete({ _id: $stores_transfer.ObjectID(_id), $req: req, $res: res }, (err, result) => {
        if (!err) {

          result.doc.items.forEach(itm => {
            let delObj = {
              name : itm.name,
              store : result.doc.store,
              vendor : result.doc.vendor,
              item : itm     
            }
            site.call('[stores_transfer][stores_items][-]' , delObj)
            site.call('item_transaction + items', Object.assign({date:new Date()}, delObj))
        })


          let Obj = {
            value: result.doc.net_value,
            safe : result.doc.safe,
            date: result.doc.date,
            number: result.doc.number
          }
          if( Obj.value && Obj.safe && Obj.date && Obj.number ){
            console.log(Obj)
            site.call('[stores_transfer][safes][-]' , Obj)
          }
          

          response.done = true
          result.doc.items.forEach(itm=>{
            itm.store = result.doc.store

          })

        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/stores_transfer/view", (req, res) => {
    let response = {}
    response.done = false
    $stores_transfer.findOne({
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

  site.post("/api/stores_transfer/all", (req, res) => {
    let response = {}
    response.done = false
    let where = req.body.where || {}
    where['academy.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (where && where['number']) {
      where['number'] = new RegExp(where['number'], 'i');
    }

    if (where && where['notes']) {
      where['notes'] = new RegExp(where['notes'], 'i');
    }
    if (where && where.store_to) {
      where['store_to.id'] =where.store_to.id;
    }

    if (where  && where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where  && where.date_from) {
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
  
    $stores_transfer.findMany({
      select: req.body.select || {},
      limit: req.body.limit,
      where: where,
      sort: { id: -1 }
    }, (err, docs , count) => {
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