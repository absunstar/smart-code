module.exports = function init(site) {
  const $file_type = site.connectCollection("file_type")

  // $file_type.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $file_type.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // }) 

  site.get({
    name: "file_type",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.on('[company][created]', doc => {

    $file_type.add({
      name_Ar: "نوع ملف إفتراضي",
      name_En: "Default File Types",
      code: "1-Test",
      image_url: '/images/file_type.png',
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
    }, (err, requestTypeDoc) => {
    })
  })



  site.post("/api/file_type/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let file_type_doc = req.body
    file_type_doc.$req = req
    file_type_doc.$res = res
    file_type_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    file_type_doc.company = site.get_company(req)
    file_type_doc.branch = site.get_branch(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'file_type',
      date: new Date()
    };
    let cb = site.getNumbering(num_obj);

    if (!file_type_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      file_type_doc.code = cb.code;
    }

    $file_type.add(file_type_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/file_type/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let file_type_doc = req.body
    file_type_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (file_type_doc.id) {
      $file_type.edit({
        where: {
          id: file_type_doc.id
        },
        set: file_type_doc,
        $req: req,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/file_type/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $file_type.findOne({
      where: {
        id: req.body.id
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

  site.post("/api/file_type/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id

    if (id) {
      $file_type.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/file_type/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $file_type.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
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