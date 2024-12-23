module.exports = function init(site) {
  const $courts = site.connectCollection("courts")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "courts",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.on('[company][created]', doc => {
    $courts.add({
      name_Ar: "محكمة إفتراضية",
      name_En : "Default Court",
      code: "1-Test",
      image_url: '/images/court.png',
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


  site.post("/api/courts/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let courts_doc = req.body
    courts_doc.$req = req
    courts_doc.$res = res

    courts_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof courts_doc.active === 'undefined') {
      courts_doc.active = true
    }

    courts_doc.company = site.get_company(req)
    courts_doc.branch = site.get_branch(req)

    $courts.find({

      where: {

        'company.id': site.get_company(req).id,
        $or: [{
          'name_Ar': courts_doc.name_Ar
        },{
          'name_En': courts_doc.name_En
        }]
      
      }
    }, (err, doc) => {
      if (!err && doc) {

        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'courts',
          date: new Date()
        };
        let cb = site.getNumbering(num_obj);

        if (!courts_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          courts_doc.code = cb.code;
        }


        $courts.add(courts_doc, (err, doc) => {
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

  site.post("/api/courts/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let courts_doc = req.body

    courts_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (courts_doc.id) {
      $courts.edit({
        where: {
          id: courts_doc.id
        },
        set: courts_doc,
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

  site.post("/api/courts/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $courts.findOne({
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

  site.post("/api/courts/delete", (req, res) => {
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
      $courts.delete({
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


  site.post("/api/courts/all", (req, res) => {
    let response = {
      done: false
    }
          
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    if (where['name_Ar']) {
      where['name_Ar'] = site.get_RegExp(where['name_Ar'], "i");
    }

    if (where['name_En']) {
      where['name_En'] = site.get_RegExp(where['name_En'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $courts.findMany({
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