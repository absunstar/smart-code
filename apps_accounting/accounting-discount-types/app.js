module.exports = function init(site) {

  const $discount_types = site.connectCollection("discount_types")

  // $discount_types.deleteDuplicate({
  //   name_Ar: 1, name_En: 1,
  //   value: 1,
  //   type: 1
  // }, (err, result) => {
  //   $discount_types.createUnique({
  //     name_Ar: 1, name_En: 1,
  //     value: 1,
  //     type: 1
  //   }, (err, result) => {

  //   })
  // })

  site.on('[company][created]', doc => {

    $discount_types.add({
      name_Ar: "خصم إفتراضي",
      name_En: "Default Discount",
      image_url: '/images/discount_type.png',
      code: "1-Test",
      value: 1,
      type: 'number',
      company: {
        id: doc.id,
        name_Ar: doc.name_Ar,
        name_En: doc.name_En
      },
      branch: {
        code: doc.branch_list[0].code,
        name_Ar: doc.branch_list[0].name_Ar,
        name_En: doc.branch_list[0].name_En
      },
      active: true
    }, (err, doc) => { })
  })


  site.get({
    name: "discount_types",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/discount_types/add", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let discount_types_doc = req.body
    discount_types_doc.$req = req
    discount_types_doc.$res = res

    discount_types_doc.company = site.get_company(req)
    discount_types_doc.branch = site.get_branch(req)

    discount_types_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

    let num_obj = {
      company: site.get_company(req),
      screen: 'discounts',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!discount_types_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      discount_types_doc.code = cb.code;
    }


    $discount_types.add(discount_types_doc, (err, _id) => {
      if (!err) {
        response.done = true
      }
      res.json(response)
    })
  })

  site.post("/api/discount_types/update", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let discount_types_doc = req.body

    discount_types_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })


    if (discount_types_doc._id) {
      $discount_types.edit({
        where: {
          _id: discount_types_doc._id
        },
        set: discount_types_doc,
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

  site.post("/api/discount_types/delete", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let _id = req.body._id


    if (_id) {
      $discount_types.delete({ _id: $discount_types.ObjectId(_id), $req: req, $res: res }, (err, result) => {
        if (!err) {
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/discount_types/view", (req, res) => {
    let response = {}
    response.done = false
    $discount_types.findOne({
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

  site.post("/api/discount_types/all", (req, res) => {

    let response = {}
    response.done = false
    let where = req.data.where || {}

    where['company.id'] = site.get_company(req).id

    $discount_types.findMany({
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