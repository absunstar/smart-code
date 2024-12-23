module.exports = function init(site) {
  const $nationalities = site.connectCollection("nationalities")

  site.on('[company][created]', doc => {
      $nationalities.add({
        code: "1-Test",
        name_Ar: "جنسية إفتراضية",
        name_En: "Default Nationality",
        image_url: '/images/nationalities.png',
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
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "nationalities",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/nationalities/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let nationalities_doc = req.body
    nationalities_doc.$req = req
    nationalities_doc.$res = res

    nationalities_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof nationalities_doc.active === 'undefined') {
      nationalities_doc.active = true
    }

    nationalities_doc.company = site.get_company(req)
    /*     nationalities_doc.branch = site.get_branch(req)
     */

    $nationalities.find({
      where: {

        'company.id': site.get_company(req).id,
        /*         'branch.code': site.get_branch(req).code,
         */
        $or: [{
          'name_Ar': nationalities_doc.name_Ar
        },{
          'name_En': nationalities_doc.name_En
        }]
      
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'nationalities',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!nationalities_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          nationalities_doc.code = cb.code;
        }

        $nationalities.add(nationalities_doc, (err, doc) => {
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

  site.post("/api/nationalities/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let nationalities_doc = req.body

    nationalities_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (nationalities_doc.id) {
      $nationalities.edit({
        where: {
          id: nationalities_doc.id
        },
        set: nationalities_doc,
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

  site.post("/api/nationalities/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $nationalities.findOne({
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

  site.post("/api/nationalities/delete", (req, res) => {
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
      $nationalities.delete({
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


  site.post("/api/nationalities/all", (req, res) => {
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


    $nationalities.findMany({
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