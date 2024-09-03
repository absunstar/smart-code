module.exports = function init(site) {

  const $in_out_names = site.connectCollection("in_out_names")

  // $in_out_names.deleteDuplicate({
  //   name_ar: 1, name_en: 1
  // }, (err, result) => {
  //   $in_out_names.createUnique({
  //     name_ar: 1, name_en: 1
  //   }, (err, result) => {

  //   })
  // })

  site.get({
    name: "in_out_names",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.on('[company][created]', doc => {
    $in_out_names.add({
      name_ar: "مسمى وارد إفتراضي",
      name_en: "Default InComing",
      image_url: '/images/in_out_name.png',
      in: true,
      code: "1-Test",
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
    }, (err, in_out_doc) => {
    
      $in_out_names.add({
        name_ar: "مسمى منصرف إفتراضي",
        name_en: "Default OutComing",
        code: "2-Test",
        image_url: '/images/in_out_name.png',
        out: true,
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
      }, (errOut, outDoc) => { 

      })
    })
  })


  site.post("/api/in_out_names/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let in_out_names_doc = req.body
    in_out_names_doc.$req = req
    in_out_names_doc.$res = res
    in_out_names_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

    in_out_names_doc.company = site.get_company(req)
    in_out_names_doc.branch = site.get_branch(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'amounts_in_out_names',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!in_out_names_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      in_out_names_doc.code = cb.code;
    }

    $in_out_names.add(in_out_names_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/in_out_names/update", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
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

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let _id = req.body._id
    if (_id) {
      $in_out_names.delete({ _id: $in_out_names.ObjectId(_id), $req: req, $res: res }, (err, result) => {
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

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $in_out_names.findOne({
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

  site.post("/api/in_out_names/all", (req, res) => {
    let response = {}

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.body.where || {};
    response.done = false

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }

    if (where['details']) {
      where['details'] = site.get_RegExp(where['details'], 'i')
    }

    if (where['in']) {
      where['in'] = true
    }

    if (where['out']) {
      where['out'] = true
    }

    where['company.id'] = site.get_company(req).id

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