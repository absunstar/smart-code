module.exports = function init(site) {

  const $facilities_codes = site.connectCollection("facilities_codes")

  site.get({
    name: "facilities_codes",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.post("/api/facilities_codes/add", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let facilities_codes_doc = req.body
    facilities_codes_doc.$req = req
    facilities_codes_doc.$res = res

    facilities_codes_doc.academy = site.get_company(req)
    facilities_codes_doc.branch = site.get_branch(req)

    facilities_codes_doc._created = site.security.getUserFinger({ $req: req, $res: res })

    $facilities_codes.add(facilities_codes_doc, (err, _id) => {
      if (!err) {
        response.done = true
      }
      res.json(response)
    })
  })

  site.post("/api/facilities_codes/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let facilities_codes_doc = req.body
    facilities_codes_doc._updated = site.security.getUserFinger({ $req: req, $res: res })

    if (facilities_codes_doc._id) {
      $facilities_codes.edit({
        where: {
          _id: facilities_codes_doc._id
        },
        set: facilities_codes_doc,
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

  site.post("/api/facilities_codes/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let _id = req.body._id
    if (_id) {
      $facilities_codes.delete({ _id: $facilities_codes.ObjectID(_id), $req: req, $res: res }, (err, result) => {
        if (!err) {
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/facilities_codes/view", (req, res) => {
    let response = {}
    response.done = false
    $facilities_codes.findOne({
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

  site.post("/api/facilities_codes/all", (req, res) => {
    let response = {}
    response.done = false

    let where = req.body.where || {}

    where['academy.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $facilities_codes.findMany({
      where: where,
      select: req.body.select || {},
      where: where,
      sort: { id: -1 },

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