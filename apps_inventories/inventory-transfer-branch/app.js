module.exports = function init(site) {

  const $transfer_branch = site.connectCollection("transfer_branch")

  $transfer_branch.deleteDuplicate({ number: 1 }, (err, result) => {
    $transfer_branch.createUnique({ number: 1 }, (err, result) => {
    })
  })


  site.post({
    name: '/api/transfer_branch/types/all',
    path: __dirname + '/site_files/json/types.json'
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
    if (req.session.user === undefined) {
      res.json(response)
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

    branch_ransfer_doc.discount = site.toNumber(branch_ransfer_doc.discount)
    branch_ransfer_doc.net_discount = site.toNumber(branch_ransfer_doc.net_discount)
    branch_ransfer_doc.total_value = site.toNumber(branch_ransfer_doc.total_value)
    branch_ransfer_doc.net_value = site.toNumber(branch_ransfer_doc.net_value)

    $transfer_branch.add(branch_ransfer_doc, (err, doc) => {
      if (!err) {

        /*    doc.items.forEach(_itm => {
             _itm.status_store_in = doc.type
             _itm.store = doc.store_from
             _itm.company = doc.company
             site.call('[store_out][stores_items][-]', Object.assign({}, _itm))
           });
   
           doc.items.forEach(_itm => {
             _itm.status_store_in = doc.type
             _itm.store = doc.store_to
             _itm.company = doc.company
             _itm.branch = doc.branch_to
             site.call('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm))
           });
    */
        response.done = true
        /* 
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
                  site.call('[transfer_branch][safes][+]', obj) */

        /*    branch_ransfer_doc.items.forEach(itm => {
             itm.company = branch_ransfer_doc.company
             itm.branch = branch_ransfer_doc.branch
             itm.vendor = branch_ransfer_doc.vendor
             itm.number = branch_ransfer_doc.number
             itm.current_status = 'sold'
             itm.date = branch_ransfer_doc.date
             itm.transaction_type = 'out'
             itm.store = branch_ransfer_doc.store
             site.call('please out item', Object.assign({}, itm))
           }) */
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/transfer_branch/confirm", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let branch_ransfer_doc = req.body
    branch_ransfer_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    branch_ransfer_doc.date = new Date(branch_ransfer_doc.date)

    if (branch_ransfer_doc._id) {
      $transfer_branch.edit({
        where: {
          _id: branch_ransfer_doc._id
        },
        set: branch_ransfer_doc,
        $req: req,
        $res: res
      }, (err,document) => {
        if (!err) {
          response.done = true
          let doc = document.doc
          doc.items.forEach(itm => {
            itm.company = doc.company
            itm.branch = doc.branch
            itm.number = doc.number
            itm.current_status = 'transfer'
            itm.date = doc.date
            itm.transaction_type = 'out'
            itm.store = doc.store_from
            site.call('please out item', Object.assign({}, itm))
          })
      
          doc.items.forEach(itm => {
            itm.company = doc.company
            itm.branch = doc.branch
            itm.number = doc.number
            itm.current_status = 'transfer'
            itm.date = doc.date
            itm.transaction_type = 'in'
            itm.store = doc.store_from
            site.call('please out item', Object.assign({}, itm))
          })
      
          doc.items.forEach(_itm => {
            _itm.status_store_in = doc.type
            _itm.store = doc.store_from
            _itm.company = doc.company
            site.call('[store_out][stores_items][-]', Object.assign({}, _itm))
          });
      
          doc.items.forEach(_itm => {
            _itm.status_store_in = doc.type
            _itm.store = doc.store_to
            _itm.company = doc.company
            _itm.branch = doc.branch_to
            site.call('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm))
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

  site.post("/api/transfer_branch/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
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
    if (req.session.user === undefined) {
      res.json(response)
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
          if (Obj.value && Obj.safe && Obj.date && Obj.number) {
            site.call('[transfer_branch][safes][+]', Obj)
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

            site.call('[transfer_branch][stores_items][-]', delObj)
            site.call('please out item', Object.assign({ date: new Date() }, itm))

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

}