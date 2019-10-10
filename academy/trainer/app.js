module.exports = function init(site) {
  const $trainer = site.connectCollection("trainer")

  site.on('[register][trainer][add]', doc => {
    $trainer.add({
      name: doc.name,
      active: true,
      mobile: doc.mobile,
      username: doc.username,
      password: doc.password,
      image_url: doc.image_url
    }, (err, doc) => {
      if (!err && doc) {
        site.call('please add user', {
          email: doc.username,
          password: doc.password,
          roles: [{
            name: "trainer"
          }],
          trainer_id: doc.id,
          branch_list : [{}],
          is_trainer: true,
          profile: {
            name: doc.name,
            mobile: doc.mobile,
            image_url: doc.image_url
          }
        })
      }
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

    trainer_doc.academy = site.get_company(req)
    trainer_doc.branch = site.get_branch(req)

    $trainer.find({
      where: {
        'academy.id': site.get_company(req).id,
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

            site.call('please add user', {
              email: doc.username,
              password: doc.password,
              roles: [{
                name: "trainer"
              }],
              trainer_id: doc.id,
              branch_list : [{}],
              is_trainer: true,
              profile: {
                name: doc.name,
                mobile: doc.mobile,
                image_url: trainer_doc.image_url
              }
            })

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
          site.call('please add user', {
            email: trainer_doc.username,
            password: trainer_doc.password,
            roles: [{
              name: "trainer"
            }],
            trainer_id: trainer_doc.id,
            branch_list : [{}],
            is_trainer: true,
            profile: {
              name: trainer_doc.name,
              mobile: trainer_doc.mobile,
              image_url: trainer_doc.image_url
            }
          })
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

    if (where['neighborhood']) {
      where['neighborhood.id'] = where['neighborhood'].id;
      delete where['neighborhood']
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

    if (req.session.user.roles[0].name === 'trainer') {
      where['id'] = req.session.user.trainer_id;
    }

    where['academy.id'] = site.get_company(req).id
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