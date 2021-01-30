module.exports = function init(site) {
  const $scans = site.connectCollection("scans")

  site.post({
    name: "/api/period_scan/all",
    path: __dirname + "/site_files/json/period_scan.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "scans",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', (doc) => {
    $scans.add(
      {
        code: "1-Test",
        name: 'أشعة إفتراضي',
        price: 1,
        immediate: true,
        image_url: '/images/scans.png',
        company: {
          id: doc.id,
          name_ar: doc.name_ar,
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar,
        },
        active: true,
      },
      (err, doc1) => {
        site.call('[register][scan_centers][add]', doc1)

      },
    );
  });

  site.post("/api/scans/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let scans_doc = req.body
    scans_doc.$req = req
    scans_doc.$res = res

    scans_doc.company = site.get_company(req);
    scans_doc.branch = site.get_branch(req);

    scans_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof scans_doc.active === 'undefined') {
      scans_doc.active = true
    }

    let num_obj = {
      company: site.get_company(req),
      screen: 'scans',
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


    $scans.find({
      where: {
        'name': scans_doc.name,
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $scans.add(scans_doc, (err, doc) => {
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

  site.post("/api/scans/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let scans_doc = req.body

    scans_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (scans_doc.id) {
      $scans.edit({
        where: {
          id: scans_doc.id
        },
        set: scans_doc,
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

  site.post("/api/scans/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $scans.findOne({
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

  site.post("/api/scans/delete", (req, res) => {
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
      $scans.delete({
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

  site.post("/api/scans/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}


    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    $scans.findMany({
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