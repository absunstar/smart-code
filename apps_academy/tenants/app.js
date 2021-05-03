module.exports = function init(site) {
  const $tenant = site.connectCollection("tenant")

  site.on('[company][created]', doc => {

    if (site.feature('academy')) 
      $tenant.add({
        active: true,
        code: "1-Test",
        name_ar: "مستأجر إفتراضي",
        name_en: "Default Tenant",
        company: {
          id: doc.id,
          name_ar: doc.name_ar,
          name_en: doc.name_en
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar,
          name_en: doc.branch_list[0].name_en
        },
        active: true,
        image_url: doc.image_url
      }, (err, doc) => {
      })

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.get({
    name: "tenant",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/tenant/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tenant_doc = req.body
    tenant_doc.$req = req
    tenant_doc.$res = res

    tenant_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof tenant_doc.active === 'undefined') {
      tenant_doc.active = true
    }

    let num_obj = {
      company: site.get_company(req),
      screen: 'tenants',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!tenant_doc.code && !cb.auto) {

      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      tenant_doc.code = cb.code;
    }


    tenant_doc.company = site.get_company(req)
    tenant_doc.branch = site.get_branch(req)

    $tenant.find({

      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,

        $or: [{
          'name_ar': tenant_doc.name_ar
        },{
          'name_en': tenant_doc.name_en
        }, {
          'phone': tenant_doc.phone
        }, {
          'mobile': tenant_doc.mobile
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name , Phone Or mobile Exists'
        res.json(response)
      } else {
        $tenant.add(tenant_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc

            site.call('please add user', {
              email: doc.username,
              password: doc.password,
              roles: [{
                name: "tenant"
              }],
              tenant_id: doc.id,
              branch_list: [{}],
              is_tenant: true,
              profile: {
                name: doc.name_ar,
                mobile: doc.mobile,
                image_url: tenant_doc.image_url
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

  site.post("/api/tenant/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tenant_doc = req.body

    tenant_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (tenant_doc.id) {
      $tenant.edit({
        where: {
          id: tenant_doc.id
        },
        set: tenant_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
          site.call('please add user', {
            email: tenant_doc.username,
            password: tenant_doc.password,
            roles: [{
              name: "tenant"
            }],
            tenant_id: tenant_doc.id,
            branch_list: [{}],
            is_tenant: true,
            profile: {
              name: tenant_doc.name,
              mobile: tenant_doc.mobile,
              image_url: tenant_doc.image_url
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

  site.post("/api/tenant/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $tenant.findOne({
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

  site.post("/api/tenant/delete", (req, res) => {
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
      $tenant.delete({
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

  site.post("/api/tenant/all", (req, res) => {
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
    if (where['facebook']) {
      where['facebook'] = site.get_RegExp(where['facebook'], "i");
    }
    if (where['twitter']) {
      where['twitter'] = site.get_RegExp(where['twitter'], "i");
    }

    if (req.session.user.roles[0].name === 'tenant') {
      where['id'] = req.session.user.tenant_id;
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $tenant.findMany({
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