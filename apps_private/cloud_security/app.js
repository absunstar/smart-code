module.exports = function init(site) {


  site.post('/api/security/permissions', (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    response.done = true;
    response.permissions = site.security.permissions
    res.json(response)
  })

  site.post('/api/security/roles', (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    response.done = true;
    response.roles = site.security.roles

    res.json(response)

  })

  site.get({
    name: "security",
    path: __dirname + "/site_files/html/index.html",
    parser: "html js",
    compress: false
  })

  site.get({
    name: "security/users",
    path: __dirname + "/site_files/html/users.html",
    parser: "html js",
    compress: false
  })

  site.get({
    name: "security/roles",
    path: __dirname + "/site_files/html/roles.html",
    parser: "html js",
    compress: false
  })

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images'
  })


  site.post('/api/users/all', (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    if (req.session.user.is_admin) {
      where = {}
    } else {
      where['company.id'] = site.get_company(req).id
      where['branch.code'] = site.get_branch(req).code
    }

    site.security.getUsers({
      where: where,
      limit: 1000
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        for (let i = 0; i < docs.length; i++) {
          let u = docs[i]
          u.profile = u.profile || {}
          u.profile.image_url = u.profile.image_url || '/images/user.png'
        }
        response.users = docs
        response.count = count
      }
      res.json(response)
    })
  })

  site.post("/api/user/add", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    let user = req.body
    user.$req = req
    user.$res = res

    user.company = site.get_company(req)
    user.branch = site.get_branch(req)


    site.$users.findMany({
      where: {
        'company.id': site.get_company(req).id,
      }
    }, (err, docs, count) => {
      if (!err && count >= (site.get_company(req).users_count || 0)) {

        response.error = `You have exceeded the maximum number of Users [ ${count} of ${site.get_company(req).users_count} ]`
        res.json(response)
      } else {

        site.security.addUser(user, (err, _id) => {
          if (!err) {
            response.done = true
          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })


  })

  site.post("/api/user/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    let user = req.body
    user.$req = req
    user.$res = res
    delete user.$$hashKey

    site.security.updateUser(user, err => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/user/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    let id = req.body.id
    if (id) {
      site.security.deleteUser({
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
      response.error = 'No ID Requested'
      res.json(response)
    }
  })

  site.post("/api/user/branches/all", (req, res) => {

    let response = {
      done: false
    }


    site.security.getUser({
      email: req.data.where.email
    }, (err, doc) => {
      if (!err && doc) {
        response.done = true
        response.list = doc.branch_list || []
      } else {
        response.error = err ? err.message : 'no doc'
      }

      if (req.data.where.email === site.options.security.admin.email) {
        response.done = true
        response.list = response.list || []
        response.list.push({
          company: {
            id: 1000000,
            name_ar: 'شركة افتراضية',
            name_en: 'Virual Company'
          },
          branch: {
            id: 1000000,
            name_ar: 'فرع افتراضى',
            name_en: 'Virual Branch'
          }
        })
      }

      res.json(response)
    })




  })

  site.post("/api/user/view", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    site.security.getUser({
      id: req.body.id
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


  site.post("/api/user/register", (req, res) => {
    let response = {}

    if (req.body.$encript) {
      if (req.body.$encript === "64") {
        req.body.email = site.fromBase64(req.body.email)
        req.body.password = site.fromBase64(req.body.password)
      } else if (req.body.$encript === "123") {
        req.body.email = site.from123(req.body.email)
        req.body.password = site.from123(req.body.password)
      }
    }

    site.security.register({
        email: req.body.email,
        password: req.body.password,
        ip: req.ip,
        permissions: ["user"],
        profile: {
          files: [],
          name: req.body.email
        },
        $req: req,
        $res: res
      },
      function (err, doc) {
        if (!err) {
          response.user = doc
          response.done = true
        } else {
          response.error = err.message
        }
        res.json(response)
      }
    )
  })


  site.post("/api/user/login", function (req, res) {

    let response = {
      accessToken: req.session.accessToken
    }

    if (req.body.$encript) {
      if (req.body.$encript === "64") {
        req.body.email = site.fromBase64(req.body.email)
        req.body.password = site.fromBase64(req.body.password)
        req.body.company = site.fromJson(site.fromBase64(req.body.company))
        req.body.branch = site.fromJson(site.fromBase64(req.body.branch))
      } else if (req.body.$encript === "123") {
        req.body.email = site.from123(req.body.email)
        req.body.password = site.from123(req.body.password)
        req.body.company = site.fromJson(site.from123(req.body.company))
        req.body.branch = site.fromJson(site.from123(req.body.branch))
      }
    }

    // if (site.security.isUserLogin(req, res)) {
    //   response.error = "Login Error , You Are Loged "
    //   response.done = true
    //   res.json(response)
    //   return
    // }

    site.security.login({
        email: req.body.email,
        password: req.body.password,
        company: req.body.company,
        branch: req.body.branch,
        $req: req,
        $res: res
      },
      function (err, user) {
        if (!err) {

          site.call('[session][update]', {
            'accessToken': req.session.accessToken,
            'company': req.body.company,
            'branch': req.body.branch
          })

          response.user = {
            id: user.id,
            _id: user._id,
            email: user.email,
            permissions: user.permissions,
            company: req.body.company,
            branch: req.body.branch
          }

          response.done = true

        } else {
          response.error = err.message
        }

        res.json(response)
      }
    )
  })

  site.post("/api/user/logout", function (req, res) {
    let response = {
      accessToken: req.session.accessToken,
      done: true
    }

    site.security.logout(req, res, (err, ok) => {
      if (ok) {
        response.done = true
        res.json(response)
      } else {
        response.error = "You Are Not Loged"
        response.done = true
        res.json(response)
      }
    })
  })


  site.post("/api/user/change-branch", function (req, res) {

    let response = {
      done : true,
      accessToken: req.session.accessToken
    }

    if (req.body.$encript) {
      if (req.body.$encript === "64") {
        req.body.branch = site.fromJson(site.fromBase64(req.body.branch))
      } else if (req.body.$encript === "123") {
        req.body.branch = site.fromJson(site.from123(req.body.branch))
      }
    }

    site.call('[session][update]', {
      'accessToken': req.session.accessToken,
      'branch': req.body.branch
    })

    res.json(response)
  })

  site.post("/api/role/add", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    let role = req.body
    role.$req = req
    role.$res = res
    site.security.addRole(role, (err, doc) => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/role/edit", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    let role = req.body
    role.$req = req
    role.$res = res
    site.security.updateRole(role, err => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/role/delete", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    let role = req.data
    role.$req = req
    role.$res = res

    site.security.deleteRole(role, (err, doc) => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })


  site.post("/api/get_dir_names", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    let z = req.body
    let w = []

    site.words.list.forEach(x => {
      z.forEach(xx => {
        if (xx.name.replace(/-/g, '_') == x.name) {
          w.push(x);
        }
      })
    })

    response.doc = w

    res.json(response)

  })

}