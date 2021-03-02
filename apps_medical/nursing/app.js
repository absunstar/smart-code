

module.exports = function init(site) {
  const $nursing = site.connectCollection("hr_employee_list")

  site.on('[register][nurse][add]', doc => {

    $nursing.add({

      code: "1-Test",
      name_ar: "ممرضة إفتراضية",
      name_en: "Default Nurse",
      image_url: '/images/nurse.png',
      specialty: {
        id: doc.id,
        code: doc.code,
        name_ar: doc.name_ar,
        name_en: doc.name_en
      },
      nurse: true,
      company: {
        id: doc.company.id,
        name_ar: doc.company.name_ar,
        name_en: doc.company.name_en
      },
      branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar,
        name_en: doc.branch.name_en
      },
      active: true
    }, (err, doc1) => { })
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.get({
    name: "nursing",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })



  site.post("/api/nursing/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let nursing_doc = req.body
    nursing_doc.$req = req
    nursing_doc.$res = res

    nursing_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof nursing_doc.active === 'undefined') {
      nursing_doc.active = true
    }


    nursing_doc.nurse = true
    nursing_doc.company = site.get_company(req)
    nursing_doc.branch = site.get_branch(req)

    $nursing.find({

      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,

        $or: [{
          'name_ar': nursing_doc.name_ar
        }, {
          'name_en': nursing_doc.name_en
        }, {
          'phone': nursing_doc.phone
        }, {
          'mobile': nursing_doc.mobile
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name , Phone Or mobile Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'nursing',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!nursing_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          nursing_doc.code = cb.code;
        }

        let user = {};

        user = {
          name: nursing_doc.name_ar,
          mobile: nursing_doc.mobile,
          username: nursing_doc.username,
          email: nursing_doc.username,
          password: nursing_doc.password,
          image_url: nursing_doc.image_url,
          gender: nursing_doc.gender,
          type: 'nurse'
        }

        user.roles = [{
          module_name: "public",
          name: "nursing_admin",
          en: "Employee Admin",
          ar: "إدارة الموظفين",
          permissions: ["nursing_manage"]
        }]


        user.profile = {
          name: user.name,
          mobile: user.mobile,
          image_url: user.image_url
        }

        user.ref_info = {
          id: nursing_doc.id
        }

        user.company = nursing_doc.company
        user.branch = nursing_doc.branch

        $nursing.add(nursing_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc


            if (user.password && user.username) {

              site.security.addUser(user, (err, doc1) => {
                if (!err) {
                  delete user._id
                  delete user.id
                  doc.user_info = {
                    id: doc1.id
                  }
                  $nursing.edit(doc, (err2, doc2) => {
                    res.json(response)
                  })
                } else {
                  response.error = err.message
                }
                res.json(response)
              })
            }
          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })
  })

  site.post("/api/nursing/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let nursing_doc = req.body
    let user = {}

    user = {
      name: nursing_doc.name_ar,
      mobile: nursing_doc.mobile,
      username: nursing_doc.username,
      email: nursing_doc.username,
      password: nursing_doc.password,
      image_url: nursing_doc.image_url,
      gender: nursing_doc.gender,
      type: 'nurse'
    }


    user.roles = [{
      module_name: "public",
      name: "nursing_admin",
      en: "Employee Admin",
      ar: "إدارة الموظفين",
      permissions: ["nursing_manage"]
    }]

    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url
    }

    user.ref_info = {
      id: nursing_doc.id
    }

    user.company = nursing_doc.company
    user.branch = nursing_doc.branch

    nursing_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (nursing_doc.id) {
      $nursing.edit({
        where: {
          id: nursing_doc.id
        },
        set: nursing_doc,
        $req: req,
        $res: res
      }, (err, nursing_doc) => {
        if (!err) {
          response.done = true
          user.nursing_id = nursing_doc.doc.id

          if (!nursing_doc.doc.user_info && user.password && user.username) {
            site.security.addUser(user, (err, doc1) => {
              if (!err) {
                delete user._id
                delete user.id
                nursing_doc.doc.user_info = {
                  id: doc1.id
                }
                $nursing.edit(nursing_doc.doc, (err2, doc2) => { res.json(response) })
              } else {
                response.error = err.message
              }
              res.json(response)
            })
          } else if (nursing_doc.doc.user_info && nursing_doc.doc.user_info.id) {
            user.id = nursing_doc.doc.user_info.id
            site.security.updateUser(user, (err, user_doc) => { })
          }

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



  site.post("/api/nursing/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $nursing.findOne({
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

  site.post("/api/nursing/delete", (req, res) => {
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
      $nursing.delete({
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


  site.post('/api/nursing/handel', (req, res) => {
    let response = {
      done: false
    }

    $nursing.findMany({
      where: { 'job.nursing': true }
    }, (err, docs) => {

      response.done = true

      docs.forEach(_doc => {
        _doc.nursing = true;
        $nursing.edit(_doc)
      });

      res.json(response)
    })
  })

  site.post("/api/nursing/all", (req, res) => {
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
        'name_ar': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'name_en': site.get_RegExp(search, "i")
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

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], "i");
    }
    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], "i");
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

    //  if (req.session.user.roles[0].name === 'nursing') {
    //   where['id'] = req.session.user.nursing_id;
    // } 

    where['nurse'] = true
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $nursing.findMany({
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