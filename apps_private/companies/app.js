module.exports = function init(site) {
  const $companies = site.connectCollection("companies")

  site.on('[register][company][add]', doc => {

    $companies.add({
      name_ar: doc.name,
      branch_list: [{
        code: 1,
        name_ar: "فرع" + " " + doc.name
      }],
      active: true,
      username: doc.username,
      password: doc.password,
      image_url: doc.image_url
    }, (err, doc) => {
      if (!err && doc) {
        site.call('[company][created]', doc)

        site.call('please add user', {
          is_company: true,
          email: doc.username,
          password: doc.password,
          roles: [{
            name: "companies_admin"
          }],
          branch_list: [{
            company: doc,
            branch: doc.branch_list[0]
          }],
          company_id: doc.id,
          profile: {
            name: doc.name_ar,
            image_url: doc.image_url
          }
        })
      }
    })
  })

  site.get_company = function (req) {
    let company = req.session('company')
    return site.fromJson(company)
  }

  site.get_branch = function (req) {
    let branch = req.session('branch')
    return site.fromJson(branch)
  }

  site.post({
    name: "/api/posting/all",
    path: __dirname + "/site_files/json/posting.json"
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "companies",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/companies/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let companies_doc = req.body
    companies_doc.$req = req
    companies_doc.$res = res

    companies_doc.company = site.get_company(req)
    companies_doc.branch = site.get_branch(req)

    if (companies_doc.branch_list.length > companies_doc.branch_count) {

      response.error = 'You have exceeded the maximum number of Branches'
      res.json(response)
    } else {


      $companies.add(companies_doc, (err, doc) => {
        if (!err) {
          response.done = true
          response.doc = doc

          site.call('[company][created]', doc)

          site.call('[user][add]', {
            is_company: true,
            company_id: doc.id,
            email: doc.username,
            password: doc.password,
            roles: [{
              name: "companies_admin"
            }],
            branch_list: [{
              company: doc,
              branch: doc.branch_list[0]
            }],
            profile: {
              name: doc.name_ar,
              mobile: doc.mobile,
              image_url: companies_doc.image_url
            }
          } , (err  , user_doc)=>{
            if(!err && user_doc){
              doc.user_id = user_doc.id
              $companies.update(doc)
            }
          })

        } else {
          response.error = err.message
        }
        res.json(response)
      })
    }
  })

  site.post("/api/companies/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let companies_doc = req.body

    if (companies_doc.id) {


      if (companies_doc.branch_list.length > companies_doc.branch_count) {

        response.error = 'You have exceeded the maximum number of Branches'
        res.json(response)

      } else {

        $companies.update({
          where: {
            id: companies_doc.id
          },
          set: companies_doc,
          $req: req,
          $res: res
        }, (err, result) => {
          if (!err) {
            response.done = true
            response.doc = result.doc

            site.call('[user][update]', {
              id : companies_doc.user_id,
              email: companies_doc.username,
              password: companies_doc.password,
              company_id: companies_doc.id,
              is_company: true,
              profile: {
                name: companies_doc.name_ar,
                mobile: companies_doc.mobile,
                image_url: companies_doc.image_url
              }
            } , (err , user_result)=>{
              if(!err && user_result.doc){
                result.doc.user_id = user_result.doc.id
                $companies.update(result.doc)
              }else{
                site.call('[user][add]', {
                  email: companies_doc.username,
                  password: companies_doc.password,
                  company_id: companies_doc.id,
                  is_company: true,
                  roles: [{
                    name: "companies_admin"
                  }],
                  branch_list: [{
                    company: companies_doc,
                    branch: companies_doc.branch_list[0]
                  }],
                  profile: {
                    name: companies_doc.name_ar,
                    mobile: companies_doc.mobile,
                    image_url: companies_doc.image_url
                  }
                } , (err , user_doc)=>{
                  if(!err && user_doc){
                    result.doc.user_id = user_doc.id
                    $companies.update(result.doc)
                  }else{
                    console.log(err)
                    console.log(user_doc)
                  }
                })
              }
            })

          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }

    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/companies/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $companies.findOne({
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

  site.post("/api/companies/delete", (req, res) => {
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
      $companies.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
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

  site.post("/api/branches/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    where['id'] = site.get_company(req).id

    $companies.findOne({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.list = docs.branch_list
        response.branch = {}
        response.list.forEach(_list => {
          if (_list.code == site.get_branch(req).code)
            response.branch = _list
        })
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.post(["/api/companies/all"], (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}



    if (req.session.user && req.session.user.is_company) {
      where['id'] = req.session.user.company_id;
    } else if (site.get_company(req) && site.get_company(req).id) {
      where['company.id'] = site.get_company(req).id
      where['branch.code'] = site.get_branch(req).code
    }
    

    $companies.findMany({
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