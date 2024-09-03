module.exports = function init(site) {

  const $tax_types = site.connectCollection("tax_types")
  // site.words.addList(__dirname + '/site_files/json/words.json')

  // $tax_types.deleteDuplicate({
  //   name_ar: 1, name_en: 1,
  //   value: 1,
  //   type: 1
  // }, (err, result) => {
  //   $tax_types.createUnique({
  //     name_ar: 1, name_en: 1,
  //     value: 1,
  //     type: 1
  //   }, (err, result) => {

  //   })
  // })


  site.get({
    name: "tax_types",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })


  site.on('[company][created]', doc => {

    $tax_types.add({
      name_ar: "ضريبة إفتراضية",
      name_en: "Default Tax",
      value : 1,
      code: "1-Test",
      image_url: '/images/tax_type.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar,
        name_en: doc.name_en
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar,
        name_en: doc.branch_list[0].name_en
      },
      active: true
    }, (err, doc) => {})
  })


  site.post("/api/tax_types/add", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let tax_types_doc = req.body
    tax_types_doc.$req = req
    tax_types_doc.$res = res

    tax_types_doc.company = site.get_company(req)
    tax_types_doc.branch = site.get_branch(req)

    tax_types_doc.add_user_info = site.security.getUserFinger({$req : req , $res : res})


    let num_obj = {
      company: site.get_company(req),
      screen: 'taxes_type',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!tax_types_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      tax_types_doc.code = cb.code;
    }

    $tax_types.add(tax_types_doc, (err, _id) => {
      if (!err) {
        response.done = true
      }
      res.json(response)
    })
  })

  site.post("/api/tax_types/update", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let tax_types_doc = req.body
    tax_types_doc.edit_user_info = site.security.getUserFinger({$req : req , $res : res})


    if (tax_types_doc._id) {
      $tax_types.edit({
        where: {
          _id: tax_types_doc._id
        },
        set: tax_types_doc,
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

  site.post("/api/tax_types/delete", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let _id = req.body._id


    if (_id) {
      $tax_types.delete({ _id: $tax_types.ObjectId(_id), $req: req, $res: res }, (err, result) => {
        if (!err) {
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/tax_types/view", (req, res) => {
    let response = {}
    response.done = false
    $tax_types.findOne({
      where: {
        _id: site.mongodb.ObjectId(req.body._id)
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

  site.post("/api/tax_types/all", (req, res) => {

    let response = {}
    response.done = false

    let where = req.data.where || {}

    where['company.id'] = site.get_company(req).id

    $tax_types.findMany({
      select: req.body.select || {},
      sort: {
        id: -1
      },
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