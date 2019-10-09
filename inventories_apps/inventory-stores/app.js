module.exports = function init(site) {

  const $stores = site.connectCollection("stores")

  site.get({
    name: "stores",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.post({
    name: '/api/stores/types/all',
    path: __dirname + '/site_files/json/types.json'
  })

  

  site.on('[register][stores][add]', doc => {

    $stores.add({
      name: "مخزن إفتراضي",
      type: { "id": 1, "en": "normal", "ar": " مخزن عادى" },
      image_url: '/images/store.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc) => { })
  })



  site.post("/api/stores/add", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_doc = req.body
    stores_doc.$req = req
    stores_doc.$res = res
    stores_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

    stores_doc.company = site.get_company(req)
    stores_doc.branch = site.get_branch(req)

    $stores.add(stores_doc, (err, _id) => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/stores/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let stores_doc = req.body
    stores_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    if (stores_doc._id) {
      $stores.edit({
        where: {
          _id: stores_doc._id
        },
        set: stores_doc,
        $req: req,
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

  site.post("/api/stores/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let _id = req.body._id


    if (_id) {
      $stores.delete({ _id: $stores.ObjectID(_id), $req: req, $res: res }, (err, result) => {
        if (!err) {
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/stores/view", (req, res) => {
    let response = {}
    response.done = false
    $stores.findOne({
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

  site.post("/api/stores/all", (req, res) => {
    let response = {}
    let where = req.body.where || {}

    if (where && where.name) {
      where['name'] = new RegExp(where['name'], 'i');
    }

    if (where && where.type) {
      where['type.ar'] = new RegExp(where['type.ar'], 'i');
    }

    if (where && where.note) {
      where['note'] = new RegExp(where['note'], 'i');
    }
    response.done = false

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $stores.findMany({
      select: req.body.select || {},
      limit: req.body.limit,
      where: where
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