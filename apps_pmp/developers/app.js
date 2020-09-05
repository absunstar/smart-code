module.exports = function init(site) {
  const $developers = site.connectCollection("developers")

 

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "developers",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/developers/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let developers_doc = req.body
    developers_doc.$req = req
    developers_doc.$res = res
    developers_doc.company = site.get_company(req)
    developers_doc.branch = site.get_branch(req)
    developers_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })



    $developers.add(developers_doc, (err, doc) => {
      if (!err) {
        response.done = true

        site.call('please add user', {
          "profile" : {
              "image_url" : developers_doc.logo,
              "files" : [],
              "name" : developers_doc.name,
              "mobile" : developers_doc.mobile
          },
          "branch_list" : [ 
              {
                  "company" :developers_doc.company,
                  "branch" : developers_doc.branch
              }
          ],
          "permissions" : [],
          "roles" : [ 
              {
                  "module_name" : "public",
                  "name" : "tasks_developer",
                  "en" : "tasks  Developer",
                  "ar" : " المطورين",
                  "permissions" : [ 
                      "tasks_developer"
                  ]
              }
          ],
          "email" :developers_doc.username,
          "password" : developers_doc.password,
          "added_user_info" : developers_doc.add_user_info
      })

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/developers/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let developers_doc = req.body

    developers_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (developers_doc.id) {
      $developers.edit({
        where: {
          id: developers_doc.id
        },
        set: developers_doc,
        $req: req,
        $res: res
      }, err => {
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

  site.post("/api/developers/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $developers.findOne({
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

  site.post("/api/developers/delete", (req, res) => {
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
      $developers.delete({
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

  site.post("/api/developers/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], "i");
    }


    $developers.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {},
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


  site.changePoints=function (option) {
    $developers.findOne({
      where: {
        id: option.id
      }
    }, (err, doc) => {
  
      doc.points =  site.toNumber(doc.points) + option.p ;  
      doc.tasks.push({
        task:option.task,
        point:option.p,
        status:option.status
      });  
      $developers.edit({
          where: {
            id: option.id
          },
          set: doc,
          $req: req,
          $res: res
        }, err2 => {
          return true

          
        })
  
      
    })
  }

}