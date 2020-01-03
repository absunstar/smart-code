module.exports = function init(site) {
  const $trainer = site.connectCollection("hr_employee_list")

  site.on('[company][created]', doc => {

    if (site.feature('gym') || site.feature('academy'))
      $trainer.add({
        name: "مدرب إفتراضي",
        image_url: '/images/trainer.png',
        job: {
          id: doc.id,
          name: doc.name,
          code: doc.code,
          trainer: doc.trainer,
        },
        company: doc.company,
        trainer: true,
        branch: doc.branch,
        active: true
      }, (err, doc) => { })
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


  site.post({
    name: "/api/indentfy_trainer/all",
    path: __dirname + "/site_files/json/indentfy_trainer.json"

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

    let where = req.body.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'name': new RegExp(search, "i")
      })

      where.$or.push({
        'mobile': new RegExp(search, "i")
      })

      where.$or.push({
        'phone': new RegExp(search, "i")
      })

      where.$or.push({
        'national_id': new RegExp(search, "i")
      })

      where.$or.push({
        'email': new RegExp(search, "i")
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
      where['name'] = new RegExp(where['name'], "i");
    }
    if (where['address']) {
      where['address'] = new RegExp(where['address'], "i");
    }
    if (where['national_id']) {
      where['national_id'] = new RegExp(where['national_id'], "i");
    }
    if (where['phone']) {
      where['phone'] = new RegExp(where['phone'], "i");
    }
    if (where['mobile']) {
      where['mobile'] = new RegExp(where['mobile'], "i");
    }

    if (where['email']) {
      where['email'] = new RegExp(where['email'], "i");
    }

    if (where['whatsapp']) {
      where['whatsapp'] = new RegExp(where['whatsapp'], "i");
    }
    if (where['twitter']) {
      where['twitter'] = new RegExp(where['twitter'], "i");
    }
    if (where['facebook']) {
      where['facebook'] = new RegExp(where['facebook'], "i");
    }

    if (where['notes']) {
      where['notes'] = new RegExp(where['notes'], "i");
    }

    /*     if (req.session.user.roles[0].name === 'trainer') {
          where['id'] = req.session.user.trainer_id;
        } */

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