module.exports = function init(site) {


  const $amounts_out = site.connectCollection("amounts_out")

  site.get({
    name: "amounts_out",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/amounts_out/add", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let amounts_out_doc = req.body
    amounts_out_doc.$req = req
    amounts_out_doc.$res = res

    amounts_out_doc.company = site.get_company(req)
    amounts_out_doc.branch = site.get_branch(req)

    amounts_out_doc.date = new Date(amounts_out_doc.date)
    amounts_out_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    $amounts_out.add(amounts_out_doc, (err, doc) => {
      if (!err) {

        let Obj = {
          value: doc.value,
          safe: doc.safe,
          company: doc.company,
          branch: doc.branch,
          date: doc.date,
          sourceName: doc.source.name,
          description: doc.description
        }
        if (Obj.value && Obj.safe && Obj.date && Obj.sourceName) {
          site.call('[amount out][safes][-]', Obj)
        }
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/amounts_out/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let amounts_out_doc = req.body
    amounts_out_doc.date = new Date(amounts_out_doc.date)
    if (amounts_out_doc._id) {
      $amounts_out.edit({
        where: {
          _id: amounts_out_doc._id
        },
        set: amounts_out_doc,
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

  site.post("/api/amounts_out/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let _id = req.body._id
    if (_id) {
      $amounts_out.delete({
        _id: $amounts_out.ObjectID(_id),
        $req: req,
        $res: res
      }, (err, result) => {

        if (!err && result.ok) {
          let Obj = {
            value: result.doc.value,
            safe: result.doc.safe,
            date: result.doc.date,
            company: result.doc.company,
            branch: result.doc.branch,
            sourceName: result.doc.source.name,
            description: result.doc.description

          }
          if (Obj.value && Obj.safe && Obj.date && Obj.sourceName) {
            site.call('[amount out][safes][+]', Obj)
          }
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/amounts_out/view", (req, res) => {
    let response = {}
    response.done = false
    $amounts_out.findOne({
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

  site.post("/api/amounts_out/all", (req, res) => {
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


    if (where.search && where.search.source) {

      where['source.id'] = where.search.source.id
    }


    if (where.search && where.search.company) {

      where['company.id'] = where.search.company.id
    }

    if (where.search && where.search.customer) {

      where['customer.id'] = where.search.customer.id
    }
    if (where['description']) {
      where['description'] = new RegExp(where['description'], 'i')
    }

    if (where['shift_code']) {
      where['shift.code'] = new RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }

    if (where.search && where.search.value) {

      where['value'] = where.search.value
    }

    delete where.search

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $amounts_out.findMany({
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