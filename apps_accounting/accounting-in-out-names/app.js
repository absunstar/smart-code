module.exports = function init(site) {

  const $in_out_names = site.connectCollection("in_out_names")

  $in_out_names.deleteDuplicate({
    name: 1
  }, (err, result) => {
    $in_out_names.createUnique({
      name: 1
    }, (err, result) => {

    })
  })

  site.get({
    name: "in_out_names",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.on('[company][created]', doc => {

    $in_out_names.add({
      name: "مسمى وارد إفتراضي",
      image_url: '/images/in_out_name.png',
      in: true,
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, in_out_doc) => {

      $in_out_names.add({
        name: "مسمى منصرف إفتراضي",
        image_url: '/images/in_out_name.png',
        out: true,
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
  })


  site.post("/api/in_out_names/add", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let in_out_names_doc = req.body
    in_out_names_doc.$req = req
    in_out_names_doc.$res = res
    in_out_names_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

    in_out_names_doc.company = site.get_company(req)
    in_out_names_doc.branch = site.get_branch(req)

    $in_out_names.add(in_out_names_doc, (err, _id) => {
      if (!err) {
        response.done = true
      }
      res.json(response)
    })
  })

  site.post("/api/in_out_names/update", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let in_out_names_doc = req.body

    in_out_names_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    if (in_out_names_doc._id) {
      $in_out_names.edit({
        where: {
          _id: in_out_names_doc._id
        },
        set: in_out_names_doc,
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

  site.post("/api/in_out_names/delete", (req, res) => {
    let response = {}
    response.done = false
    if (req.session.user === undefined) {
      res.json(response)
    }
    let _id = req.body._id
    if (_id) {
      $in_out_names.delete({ _id: $in_out_names.ObjectID(_id), $req: req, $res: res }, (err, result) => {
        if (!err) {
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/in_out_names/view", (req, res) => {
    let response = {}
    response.done = false
    $in_out_names.findOne({
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

  site.post("/api/in_out_names/all", (req, res) => {
    let response = {}
    let where = req.body.where || {};
    response.done = false

    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }

    if (where['details']) {
      where['details'] = new RegExp(where['details'], 'i')
    }

    if (where['in']) {
      where['in'] = true
    }

    if (where['out']) {
      where['out'] = true
    }

    where['company.id'] = site.get_company(req).id
    /*     where['branch.code'] = site.get_branch(req).code
     */
    $in_out_names.findMany({
      select: req.body.select || {},
      sort: { id: -1 },
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