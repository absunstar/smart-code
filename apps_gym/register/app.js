module.exports = function init(site) {
  const $register = site.connectCollection("register")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "register",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/register/add", (req, res) => {

    let response = {
      done: false
    }

    let register_doc = req.body
    register_doc.$req = req
    register_doc.$res = res

    register_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    $register.add(register_doc, (err, doc) => {
      if (!err) {
        response.done = true

        if (doc.company_name) {
          let company = {
            name: doc.company_name,
            mobile: doc.company_mobile,
            username: doc.company_user_name,
            password: doc.company_password,
            image_url: doc.image_url
          }


          site.call('[register][company][add]', company, (err, new_company) => {

          /*   site.security.login({
              email: doc.company_user_name,
              password: doc.company_password,
              $req: req,
              $res: res
            },
              function (err, user_login) {
                console.log(user_login);
                console.log("ssssssssssssssssssssssssssssssssss");
                
                if (!err) {
                  response.user = user_login
                  response.done = true
                } else {
                  console.log(err)
                  response.error = err.message
                }
  
                res.json(response)
              }
            ) */

          })

         
        }
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/register/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let register_doc = req.body

    register_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (register_doc.id) {
      $register.edit({
        where: {
          id: register_doc.id
        },
        set: register_doc,
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

  site.post("/api/register/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $register.findOne({
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

  site.post("/api/register/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    if (where['customer_service']) {
      where['customer_service'] = new RegExp(where['customer_service'], "i");
    }

    if (where['online_chat']) {
      where['online_chat'] = new RegExp(where['online_chat'], "i");
    }



    $register.findMany({
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

  site.post("/api/register/delete", (req, res) => {
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
      $register.delete({
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

}