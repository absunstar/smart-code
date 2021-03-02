module.exports = function init(site) {
  const $adjectives = site.connectCollection("adjectives")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "adjectives",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $adjectives.add({
      name_ar: "صفة إفتراضية",
      name_en : "Default Adjective",
      image_url: '/images/adjectives.png',
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
    }, (err, doc) => {})
  })


  site.post("/api/adjectives/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let adjectives_doc = req.body
    adjectives_doc.$req = req
    adjectives_doc.$res = res

    adjectives_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof adjectives_doc.active === 'undefined') {
      adjectives_doc.active = true
    }

    adjectives_doc.company = site.get_company(req)
    adjectives_doc.branch = site.get_branch(req)

    $adjectives.find({

      where: {
        
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        $or: [{
          'name_ar': adjectives_doc.name_ar
        },{
          'name_en': adjectives_doc.name_en
        }]
      
      }
    }, (err, doc) => {
      if (!err && doc) {
        
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'adjectives',
          date: new Date()
        };
        let cb = site.getNumbering(num_obj);
    
        if (!adjectives_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;
    
        } else if (cb.auto) {
          adjectives_doc.code = cb.code;
        }

        $adjectives.add(adjectives_doc, (err, doc) => {
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

  site.post("/api/adjectives/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let adjectives_doc = req.body

    adjectives_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (adjectives_doc.id) {
      $adjectives.edit({
        where: {
          id: adjectives_doc.id
        },
        set: adjectives_doc,
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

  site.post("/api/adjectives/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $adjectives.findOne({
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

  site.post("/api/adjectives/delete", (req, res) => {
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
      $adjectives.delete({
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


  site.post("/api/adjectives/all", (req, res) => {
    let response = {
      done: false
    }
          
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], "i");
    }

    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $adjectives.findMany({
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