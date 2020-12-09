module.exports = function init(site) {

  const $insurances_slides = site.connectCollection("insurances_slides")

  site.get({
    name: "insurances_slides",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $insurances_slides.add({
      name: "شريحة تأمين إفتراضية",
      image_url: '/images/insurance_slides.png',
      value: 1,
      code: "1-Test",
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, in_out_doc) => { })
  })

  site.post("/api/insurances_slides/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let insurances_slides_doc = req.body
    insurances_slides_doc.$req = req
    insurances_slides_doc.$res = res
    insurances_slides_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    insurances_slides_doc.company = site.get_company(req)
    insurances_slides_doc.branch = site.get_branch(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'insurance_slides',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!insurances_slides_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      insurances_slides_doc.code = cb.code;
    }

    $insurances_slides.add(insurances_slides_doc, (err, _id) => {
      if (!err) {
        response.done = true
      }
      res.json(response)
    })
  })

  site.post("/api/insurances_slides/update", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let insurances_slides_doc = req.body
    insurances_slides_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (insurances_slides_doc._id) {
      $insurances_slides.edit({
        where: {
          _id: insurances_slides_doc._id
        },
        set: insurances_slides_doc,
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

  site.post("/api/insurances_slides/delete", (req, res) => {
    let response = {}
    response.done = false
    
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let _id = req.body._id
    if (_id) {
      $insurances_slides.delete({
        _id: $insurances_slides.ObjectID(_id),
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/insurances_slides/view", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $insurances_slides.findOne({
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

  site.post("/api/insurances_slides/all", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }
    if (where['details']) {
      where['details'] = site.get_RegExp(where['details'], 'i')
    }

    where['company.id'] = site.get_company(req).id

    $insurances_slides.findMany({
      select: req.body.select || {},
      where: where,
      limit: req.body.limit,
      sort: {
        id: -1
      }
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