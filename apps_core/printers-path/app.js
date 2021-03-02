module.exports = function init(site) {
  const $printers_path = site.connectCollection("printers_path")

  site.get({
    name: "printers_path",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post({
    name: '/api/printer_type/all',
    path: __dirname + '/site_files/json/printer_type.json'
  });


  site.on('[company][created]', doc => {

    $printers_path.add({
      name_ar: "مسار طابعة إفتراضية",
      name_en: "Default Printers Path",
      type : "نوع إفتراضي",
      code: "1-Test",
      ip : "OneNote",
      image_url: '/images/printer_path.png',
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
    }, (err, doc) => {
    })
  })



  site.post("/api/printers_path/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let printers_path_doc = req.body
    printers_path_doc.$req = req
    printers_path_doc.$res = res

    let num_obj = {
      company: site.get_company(req),
      screen: 'printers_path',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!printers_path_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      printers_path_doc.code = cb.code;
    }
    printers_path_doc.company = site.get_company(req)
    printers_path_doc.branch = site.get_branch(req)


    $printers_path.add(printers_path_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/printers_path/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let printers_path_doc = req.body

    if (printers_path_doc.id) {
      $printers_path.edit({
        where: {
          id: printers_path_doc.id
        },
        set: printers_path_doc,
        $req: req,
        $req: req,
        $res: res
      },(err , result) => {
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

  site.post("/api/printers_path/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $printers_path.findOne({
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

  site.post("/api/printers_path/delete", (req, res) => {
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
      $printers_path.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc=result.doc
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

  site.all("/api/printers_path/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let where = req.data.where || {}    

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }
    if (where['type']) {
      where['type'] = site.get_RegExp(where['type'], 'i')
    }
    if (where['ip']) {
      where['ip'] = site.get_RegExp(where['ip'], 'i')
    }

    if (where['active'] !== 'all') {
      where['active'] = true
    } else {
      delete where['active']
    }

    where['company.id'] = site.get_company(req).id
   

    $printers_path.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {id:-1},
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