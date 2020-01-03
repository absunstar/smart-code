module.exports = function init(site) {
  const $amounts_in = site.connectCollection("amounts_in")

  site.get({
    name: "amounts_in",
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

  $amounts_in.newCode = function () {

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

  site.post("/api/amounts_in/add", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    let amounts_in_doc = req.data
    amounts_in_doc.$req = req
    amounts_in_doc.$res = res
    amounts_in_doc.code = $amounts_in.newCode();
    amounts_in_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    amounts_in_doc.company = site.get_company(req)
    amounts_in_doc.branch = site.get_branch(req)

    $amounts_in.add(amounts_in_doc, (err, doc) => {
      if (!err) {
        if (doc.posting) {

          let obj = {
            value: doc.value,
            safe: doc.safe,
            date: doc.date,
            company: doc.company,
            branch: doc.branch,
            sourceName: doc.source.name,
            payment_method: doc.payment_method,
            description: doc.description,
            code: doc.code,
            shift: {
              id: doc.shift.id,
              code: doc.shift.code,
              name: doc.shift.name
            },
            operation: 'وارد',
            transition_type: 'in'
          }
          if (obj.value && obj.safe && obj.date && obj.sourceName) {
            site.call('[amounts][safes][+]', obj)
          }
        }

        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/amounts_in/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let amounts_in_doc = req.body
    amounts_in_doc.date = new Date(amounts_in_doc.date)

    amounts_in_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (amounts_in_doc._id) {
      $amounts_in.edit({
        where: {
          _id: amounts_in_doc._id
        },
        set: amounts_in_doc,
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

  site.post("/api/amounts_in/posting", (req, res) => {
    if (req.session.user === undefined)
      res.json(response)

    let response = {}
    response.done = false

    let amounts_in_doc = req.body

    amounts_in_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    if (amounts_in_doc._id) {
      $amounts_in.edit({
        where: {
          _id: amounts_in_doc._id
        },
        set: amounts_in_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc

          let obj = {
            value: result.doc.value,
            safe: result.doc.safe,
            date: result.doc.date,
            company: result.doc.company,
            branch: result.doc.branch,
            sourceName: result.doc.source.name,
            code: result.doc.code,
            shift: {
              id: result.doc.shift.id,
              code: result.doc.shift.code,
              name: result.doc.shift.name
            },
            payment_method: result.doc.payment_method,
            description: result.doc.description,
          }

          if (result.doc.posting) {
            obj.operation = 'وارد'
            obj.transition_type = 'in'
          }
          else {
            obj.operation = 'فك ترحيل وارد'
            obj.transition_type = 'out'
          }

          if (obj.value && obj.safe && obj.date)
            site.call('[amounts][safes][+]', obj)

        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })


  site.post("/api/amounts_in/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let id = req.body.id
    if (id) {
      $amounts_in.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err && result) {
          if (result.doc.posting) {

            let obj = {
              value: result.doc.value,
              safe: result.doc.safe,
              date: result.doc.date,
              company: result.doc.company,
              branch: result.doc.branch,
              sourceName: result.doc.source.name,
              code: result.doc.code,
              description: result.doc.description,
              shift: {
                id: result.doc.shift.id,
                code: result.doc.shift.code,
                name: result.doc.shift.name
              },
              payment_method: result.doc.payment_method,
              operation: 'حذف وارد',
              transition_type: 'out'
            }
            if (obj.value && obj.safe && obj.date && obj.sourceName) {
              site.call('[amounts][safes][+]', obj)
            }
          }

          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/amounts_in/view", (req, res) => {
    let response = {}
    response.done = false
    $amounts_in.findOne({
      id: req.body.id
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

  site.post("/api/amounts_in/all", (req, res) => {
    let response = {}
    response.done = false

    let where = req.body.where || {}

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

    if (where.search && where.search.date) {
      let d1 = site.toDate(where.search.date)
      let d2 = site.toDate(where.search.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where && where.search && where.search.date_from) {
      let d1 = site.toDate(where.search.date_from)
      let d2 = site.toDate(where.search.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where['shift_code']) {
      where['shift.code'] = new RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }


    if (where.search && where.search.source) {

      where['source.id'] = where.search.source.id
    }

    if (where.search && where.search.company) {

      where['company.id'] = where.search.company.id
    }

    if (where.search && where.search.customer) {

      where['customer.id'] = where.search.customer.id
    }

    if (where.search && where.search.employee) {

      where['employee.id'] = where.search.employee.id
    }

    if (where['description']) {
      where['description'] = new RegExp(where['description'], 'i')
    }

    if (where.search && where.search.value) {

      where['value'] = where.search.value
    }

    delete where.search

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $amounts_in.findMany({
      select: req.body.select || {},
      where: where,
      limit: req.body.limit,

      sort: {
        id: -1
      },

    }, (err, docs) => {
      if (!err) {
        response.done = true
        response.list = docs
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}