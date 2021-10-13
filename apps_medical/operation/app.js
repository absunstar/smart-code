module.exports = function init(site) {
  const $operation = site.connectCollection("operation")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "operation",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', (doc) => {
    $operation.add(
      {
        code: "1-Test",
        name_ar: 'عملية إفتراضية',
        name_en: "Default Operation",
        price: 1,
        image_url: '/images/medical_specialty.png',
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
        active: true,
      },
      (err, doc1) => {
     
      },
    );
  });

  site.post("/api/operation/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let operation_doc = req.body
    operation_doc.$req = req
    operation_doc.$res = res

    operation_doc.company = site.get_company(req);
    operation_doc.branch = site.get_branch(req);

    operation_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof operation_doc.active === 'undefined') {
      operation_doc.active = true
    }

    $operation.find({
      where: {
  
        'company.id': site.get_company(req).id,
        $or: [{
          'name_ar': operation_doc.name_ar
        },{
          'name_en': operation_doc.name_en
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'operations',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!operation_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          operation_doc.code = cb.code;
        }

        $operation.add(operation_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc
          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })
  })

  site.post("/api/operation/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let operation_doc = req.body

    operation_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (operation_doc.id) {
      $operation.edit({
        where: {
          id: operation_doc.id
        },
        set: operation_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = 'Code Already Exist'
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/operation/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $operation.findOne({
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

  site.post("/api/operation/delete", (req, res) => {
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
      $operation.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
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

  site.post("/api/operation/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name_ar']) {
      where['name_ar'] = new RegExp(where['name_ar'], "i");
    }

    if (where['name_en']) {
      where['name_en'] = new RegExp(where['name_en'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $operation.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
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