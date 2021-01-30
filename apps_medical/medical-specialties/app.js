module.exports = function init(site) {
  const $medical_specialties = site.connectCollection("medical_specialties")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "medical_specialties",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', (doc) => {
    $medical_specialties.add(
      {
        code: "1-Test",
        name: 'تخصص إفتراضي',
        image_url: '/images/medical_specialty.png',
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
        site.call('[register][doctor][add]', doc1);
        site.call('[register][nurse][add]', doc1);
      },
    );
  });

  site.post("/api/medical_specialties/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let medical_specialties_doc = req.body

    medical_specialties_doc.$req = req
    medical_specialties_doc.$res = res

    medical_specialties_doc.company = site.get_company(req);
    medical_specialties_doc.branch = site.get_branch(req);

    medical_specialties_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof medical_specialties_doc.active === 'undefined') {
      medical_specialties_doc.active = true
    }

    $medical_specialties.find({
      where: {
        'name': medical_specialties_doc.name,
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
          screen: 'medical_specialties',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!medical_specialties_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          medical_specialties_doc.code = cb.code;
        }

        $medical_specialties.add(medical_specialties_doc, (err, doc) => {
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

  site.post("/api/medical_specialties/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let medical_specialties_doc = req.body

    medical_specialties_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (medical_specialties_doc.id) {
      $medical_specialties.edit({
        where: {
          id: medical_specialties_doc.id
        },
        set: medical_specialties_doc,
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

  site.post("/api/medical_specialties/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $medical_specialties.findOne({
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

  site.post("/api/medical_specialties/delete", (req, res) => {
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
      $medical_specialties.delete({
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

  site.post("/api/medical_specialties/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['code']) {
      where['code'] = new RegExp(where['code'], "i");
    }

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $medical_specialties.findMany({
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