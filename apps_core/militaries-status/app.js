module.exports = function init(site) {

  const $militaries_status = site.connectCollection("militaries_status")

  site.get({
    name: "militaries_status",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $militaries_status.add({
      name: "موقف تجنيد إفتراضي",
      code : "1",
      image_url: '/images/military.png',
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc) => {})
  })

  site.post("/api/militaries_status/add", (req, res) => {
    let response = {}
    response.done = false

            
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let doc = req.body
    doc.$req = req
    doc.$res = res
    doc.company = site.get_company(req)
    doc.branch = site.get_branch(req)
    doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    let num_obj = {
      company: site.get_company(req),
      screen: 'militaies',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      doc.code = cb.code;
    }

    $militaries_status.add(doc, (err, id) => {
      if (!err) {
        response.done = true
      }
      res.json(response)
    })
  })

  site.post("/api/militaries_status/update", (req, res) => {
    let response = {}
    response.done = false

          
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let doc = req.body
    doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (doc.id) {
      $militaries_status.edit({
        where: {
          id: doc.id
        },
        set: doc,
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

  site.post("/api/militaries_status/delete", (req, res) => {
    let response = {}
    response.done = false

            
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let id = req.body.id
    if (id) {
      $militaries_status.delete({
        id: id,
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

  site.post("/api/militaries_status/view", (req, res) => {
    let response = {}
    response.done = false
              
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    $militaries_status.find({
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

  site.post("/api/militaries_status/all", (req, res) => {
    let response = {}
    response.done = false
              
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.body.where || {}
    where['company.id'] = site.get_company(req).id

    $militaries_status.findMany({
      select: req.body.select || {},
      where: where,
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