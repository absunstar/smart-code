module.exports = function init(site) {
  const $doctors = site.connectCollection("hr_employee_list")

  site.on('[register][doctor][add]', doc => {

    $doctors.add({

      code: "1-Test",
      name_ar: "طبيب إفتراضي",
      name_en: "Default Doctor",
      image_url: '/images/doctors.png',
      specialty: {
        id: doc.id,
        code: doc.code,
        name_ar: doc.name_ar,
        name_en: doc.name_en,
      },
      doctor: true,
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
    name: "doctors",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })



  site.post("/api/doctors/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let doctor_doc = req.body
    doctor_doc.$req = req
    doctor_doc.$res = res

    doctor_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof doctor_doc.active === 'undefined') {
      doctor_doc.active = true
    }
    doctor_doc.doctor = true

    doctor_doc.company = site.get_company(req)
    doctor_doc.branch = site.get_branch(req)

    $doctors.find({

      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,

        $or: [{
          'name_ar': doctor_doc.name_ar
        },{
          'name_en': doctor_doc.name_en
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name , Phone Or mobile Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'doctors',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!doctor_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          doctor_doc.code = cb.code;
        }


        let user = {};

        user = {
          name: doctor_doc.name_ar,
          mobile: doctor_doc.mobile,
          username: doctor_doc.username,
          email: doctor_doc.username,
          password: doctor_doc.password,
          image_url: doctor_doc.image_url,
          gender: doctor_doc.gender,
          type: 'doctor'
        }

        user.roles = [{
          module_name: "public",
          name: "doctor_admin",
          en: "Employee Admin",
          ar: "إدارة الموظفين",
          permissions: ["doctor_manage"]
        }]

        user.profile = {
          name: user.name,
          mobile: user.mobile,
          image_url: user.image_url
        }

        user.ref_info = {
          id: doctor_doc.id
        }

        user.company = doctor_doc.company
        user.branch = doctor_doc.branch



        $doctors.add(doctor_doc, (err, doc) => {
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
                  $doctors.edit(doc, (err2, doc2) => {
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

  site.post("/api/doctors/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let doctor_doc = req.body
    let user = {}

    user = {
      name: doctor_doc.name_ar,
      mobile: doctor_doc.mobile,
      username: doctor_doc.username,
      email: doctor_doc.username,
      password: doctor_doc.password,
      image_url: doctor_doc.image_url,
      gender: doctor_doc.gender,
      type: 'doctor'
    }

    user.roles = [{
      module_name: "public",
      name: "doctor_admin",
      en: "Employee Admin",
      ar: "إدارة الموظفين",
      permissions: ["doctor_manage"]
    }]


    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url
    }

    user.ref_info = {
      id: doctor_doc.id
    }

    user.company = doctor_doc.company
    user.branch = doctor_doc.branch

    doctor_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (doctor_doc.id) {
      $doctors.edit({
        where: {
          id: doctor_doc.id
        },
        set: doctor_doc,
        $req: req,
        $res: res
      }, (err, doctor_doc) => {
        if (!err) {
          response.done = true
          user.doctor_id = doctor_doc.doc.id

          if (!doctor_doc.doc.user_info && user.password && user.username) {
            site.security.addUser(user, (err, doc1) => {
              if (!err) {
                delete user._id
                delete user.id
                doctor_doc.doc.user_info = {
                  id: doc1.id
                }
                $doctors.edit(doctor_doc.doc, (err2, doc2) => { res.json(response) })
              } else {
                response.error = err.message
              }
              res.json(response)
            })
          } else if (doctor_doc.doc.user_info && doctor_doc.doc.user_info.id) {
            user.id = doctor_doc.doc.user_info.id
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



  site.post("/api/doctors/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $doctors.findOne({
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

  site.post("/api/doctors/delete", (req, res) => {
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
      $doctors.delete({
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


  site.post('/api/doctors/handel', (req, res) => {
    let response = {
      done: false
    }

    $doctors.findMany({
      where: { 'job.doctors': true }
    }, (err, docs) => {

      response.done = true

      docs.forEach(_doc => {
        _doc.doctor = true;
        $doctors.edit(_doc)
      });

      res.json(response)
    })
  })

  site.post("/api/doctors/all", (req, res) => {
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

    //  if (req.session.user.roles[0].name === 'doctors') {
    //   where['id'] = req.session.user.doctor_id;
    // } 

    where['doctor'] = true
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $doctors.findMany({
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