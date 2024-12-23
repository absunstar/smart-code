module.exports = function init(site) {
  const $circles = site.connectCollection("circles")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "circles",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $circles.add({
      name_Ar: "دائرة إفتراضية",
      name_En: "Default Circle",
      image_url: '/images/circle.png',
      code: "1-Test",
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


  site.post("/api/circles/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let circles_doc = req.body
    circles_doc.$req = req
    circles_doc.$res = res

    circles_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof circles_doc.active === 'undefined') {
      circles_doc.active = true
    }

    circles_doc.company = site.get_company(req)
    circles_doc.branch = site.get_branch(req)

    $circles.find({

      where: {

        'company.id': site.get_company(req).id,
        $or: [{
          'name_Ar': circles_doc.name_Ar
        },{
          'name_En': circles_doc.name_En
        }]
   
      }
    }, (err, doc) => {
      if (!err && doc) {

        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'circles',
          date: new Date()
        };
        let cb = site.getNumbering(num_obj);

        if (!circles_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          circles_doc.code = cb.code;
        }

        $circles.add(circles_doc, (err, doc) => {
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

  site.post("/api/circles/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let circles_doc = req.body

    circles_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (circles_doc.id) {
      $circles.edit({
        where: {
          id: circles_doc.id
        },
        set: circles_doc,
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

  site.post("/api/circles/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $circles.findOne({
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

  site.post("/api/circles/delete", (req, res) => {
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
      $circles.delete({
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


  site.post("/api/circles/all", (req, res) => {

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
    // where['branch.code'] = site.get_branch(req).code

    $circles.findMany({
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