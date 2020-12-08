module.exports = function init(site) {
  const $trainer = site.connectCollection("hr_employee_list")

  site.on('[company][created]', doc => {

    if (site.feature('gym') || site.feature('academy') || site.feature('school')) {

      $trainer.add({
        name: site.feature('school') ? "مدرس إفتراضي" : "مدرب إفتراضي",
        image_url: '/images/trainer.png',
        job: {
          id: doc.id,
          name: doc.name,
          code: doc.code,
          trainer: doc.trainer,
        },
        trainer: true,
        company: {
          id: doc.id,
          name_ar: doc.name_ar
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar
        },
        active: true
      }, (err, doc) => { })
    }
  })

  site.on('[attend_session][busy][+]', obj => {
    $trainer.findOne({
      where: { id: obj.trainerId }
    }, (err, doc) => {
      if (obj.busy) doc.busy = true;
      else doc.busy = false;
      if (!err && doc) $trainer.edit(doc)
    })
  })



  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.get({
    name: "trainer",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/trainer/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let trainer_doc = req.body
    trainer_doc.$req = req
    trainer_doc.$res = res

    trainer_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof trainer_doc.active === 'undefined') {
      trainer_doc.active = true
    }

    trainer_doc.trainer = true
    trainer_doc.company = site.get_company(req)
    trainer_doc.branch = site.get_branch(req)

    $trainer.find({
      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,

        $or: [{
          'name': trainer_doc.name
        }, {
          'phone': trainer_doc.phone
        }, {
          'mobile': trainer_doc.mobile
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name , Phone Or mobile Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'trainer',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!trainer_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          trainer_doc.code = cb.code;
        }

        $trainer.add(trainer_doc, (err, doc) => {
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

  site.post("/api/trainer/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let trainer_doc = req.body

    trainer_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (trainer_doc.id) {
      $trainer.edit({
        where: {
          id: trainer_doc.id
        },
        set: trainer_doc,
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

  site.post("/api/trainer/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $trainer.findOne({
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

  site.post("/api/trainer/delete", (req, res) => {
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
      $trainer.delete({
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


  site.post('/api/trainer/handel', (req, res) => {
    let response = {
      done: false
    }

    $trainer.findMany({
      where: { 'job.trainer': true }
    }, (err, docs) => {

      response.done = true

      docs.forEach(_doc => {
        _doc.trainer = true;
        $trainer.edit(_doc)
      });

      res.json(response)
    })
  })

  site.post("/api/trainer/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'name': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'mobile': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'phone': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'national_id': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'email': site.get_RegExp(search, "i")
      })

    }

    if (where['gov']) {
      where['gov.id'] = where['gov'].id;
      delete where['gov']
      delete where.active
    }

    if (where['city']) {
      where['city.id'] = where['city'].id;
      delete where['city']
      delete where.active
    }
    if (where['area']) {
      where['area.id'] = where['area'].id;
      delete where['area']
      delete where.active
    }

    if (where['specialty']) {
      where['specialty.id'] = where['specialty'].id;
      delete where['specialty']
      delete where.active
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], "i");
    }
    if (where['address']) {
      where['address'] = site.get_RegExp(where['address'], "i");
    }
    if (where['national_id']) {
      where['national_id'] = site.get_RegExp(where['national_id'], "i");
    }
    if (where['phone']) {
      where['phone'] = site.get_RegExp(where['phone'], "i");
    }
    if (where['mobile']) {
      where['mobile'] = site.get_RegExp(where['mobile'], "i");
    }

    if (where['email']) {
      where['email'] = site.get_RegExp(where['email'], "i");
    }

    if (where['whatsapp']) {
      where['whatsapp'] = site.get_RegExp(where['whatsapp'], "i");
    }
    if (where['twitter']) {
      where['twitter'] = site.get_RegExp(where['twitter'], "i");
    }
    if (where['facebook']) {
      where['facebook'] = site.get_RegExp(where['facebook'], "i");
    }

    if (where['notes']) {
      where['notes'] = site.get_RegExp(where['notes'], "i");
    }

    //  if (req.session.user.roles[0].name === 'trainer') {
    //   where['id'] = req.session.user.trainer_id;
    // } 

    where['trainer'] = true
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $trainer.findMany({
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