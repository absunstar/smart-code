module.exports = function init(site) {
  const $analyses = site.connectCollection("analyses")

  site.post({
    name: "/api/period_analyses/all",
    path: __dirname + "/site_files/json/period_analyses.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "analyses",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', (doc) => {
    $analyses.add(
      {
        code: "1-Test",
        name: 'تحليل إفتراضي',
        price: 1,
        immediate: true,
        image_url: '/images/analyses.png',
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
        site.call('[register][analyses_centers][add]', doc1)

      },
    );
  });

  site.post("/api/analyses/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let analyses_doc = req.body
    analyses_doc.$req = req
    analyses_doc.$res = res

    analyses_doc.company = site.get_company(req);
    analyses_doc.branch = site.get_branch(req);

    analyses_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof analyses_doc.active === 'undefined') {
      analyses_doc.active = true
    }

    $analyses.find({
      where: {
        'name': analyses_doc.name,
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        let num_obj = {
          company: site.get_company(req),
          screen: 'analyses',
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

        $analyses.add(analyses_doc, (err, doc) => {
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

  site.post("/api/analyses/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let analyses_doc = req.body

    analyses_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (analyses_doc.id) {
      $analyses.edit({
        where: {
          id: analyses_doc.id
        },
        set: analyses_doc,
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

  site.post("/api/analyses/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $analyses.findOne({
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


  site.post("/api/analyses/delete", (req, res) => {
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
      $analyses.delete({
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

  site.post("/api/analyses/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    $analyses.findMany({
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