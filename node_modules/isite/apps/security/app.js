module.exports = function init(site) {

  site.post('/api/security/permissions', (req, res) => {

    let response = {
      done: !1
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    response.done = !0;
    response.permissions = site.security.permissions
    res.json(response)
  })

  site.post('/api/security/roles', (req, res) => {

    let response = {
      done: !1
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    response.done = !0;
    response.roles = site.security.roles
    res.json(response)
  })

  site.get({
    name: ["security" , "security/users"],
    path: __dirname + "/site_files/html/index.html",
    parser: "html css js",
    compress: !1
  })

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images'
  })


  site.post('/api/users/all', (req, res) => {

    let response = {
      done: !1
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    site.security.getUsers({
      limit: 1000
    }, (err, docs, count) => {
      if (!err) {
        response.done = !0
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
      done: !1
    }

    if (!req.session.user) {
      response.error = 'You Are Not Login'
      res.json(response)
      return
    }

    let user = req.body
    user.$req = req
    user.$res = res
    site.security.addUser(user, (err, _id) => {
      if (!err) {
        response.done = !0
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/user/update", (req, res) => {
    let response = {
      done: !1
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
        response.done = !0
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/user/delete", (req, res) => {
    let response = {
      done: !1
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
          response.done = !0
        }else{
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'No ID Requested'
      res.json(response)
    }
  })

  site.post("/api/user/view", (req, res) => {

    let response = {
      done: !1
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
        response.done = !0
        response.doc =doc
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
          response.done = !0
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
      } else if (req.body.$encript === "123") {
        req.body.email = site.from123(req.body.email)
        req.body.password = site.from123(req.body.password)
      }
    }

    if (site.security.isUserLogin(req, res)) {
      response.error = "Login Error , You Are Loged "
      response.done = !0
      res.json(response)
      return
    }

    site.security.login({
        email: req.body.email,
        password: req.body.password,
        $req: req,
        $res: res
      },
      function (err, user) {
        if (!err) {

          response.user = user

          response.done = !0

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
      done: !0
    }

    site.security.logout(req, res, (err, ok) => {
      if (ok) {
        response.done = !0
        res.json(response)
      } else {
        response.error = "You Are Not Loged"
        response.done = !0
        res.json(response)
      }
    })
  })


}