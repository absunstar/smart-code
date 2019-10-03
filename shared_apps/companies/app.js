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

        site.call('[register][gov][add]', doc)
        site.call('[register][items_group][add]', doc)
        site.call('[register][tax_types][add]', doc)
        site.call('[register][discount_types][add]', doc)
        site.call('[register][delivery_employee][add]', doc)
        site.call('[register][employee][add]', doc)
        site.call('[register][customers_group][add]', doc)
        site.call('[register][vendors_group][add]', doc)
        site.call('[register][stores][add]', doc)
        site.call('[register][safes][add]', doc)
        site.call('[register][tables_group][add]', doc)
        site.call('[register][kitchen][add]', doc)

        site.call('please add user', {
          id: doc.id,
          email: doc.username,
          password: doc.password,
          branch_list: [{}],
          roles: [{
            name: "companies_admin"
          }],
          branch_list: [{
            company: doc,
            branch: doc.branch_list[0]
          }],
          companies_id: doc.id,
          is_companies: true,
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

    $companies.add(companies_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc

        site.call('[register][gov][add]', doc)
        site.call('[register][items_group][add]', doc)
        site.call('[register][tax_types][add]', doc)
        site.call('[register][discount_types][add]', doc)
        site.call('[register][delivery_employee][add]', doc)
        site.call('[register][employee][add]', doc)
        site.call('[register][customers_group][add]', doc)
        site.call('[register][vendors_group][add]', doc)
        site.call('[register][stores][add]', doc)
        site.call('[register][safes][add]', doc)
        site.call('[register][tables_group][add]', doc)
        site.call('[register][kitchen][add]', doc)

        site.call('please add user', {
          id: doc.id,
          email: doc.username,
          password: doc.password,
          roles: [{
            name: "companies_admin"
          }],
          branch_list: [{
            company: doc,
            branch: doc.branch_list[0]
          }],
          companies_id: doc.id,
          is_companies: true,
          profile: {
            name: doc.name_ar,
            mobile: doc.mobile,
            image_url: companies_doc.image_url
          }
        })

      } else {
        response.error = err.message
      }
      res.json(response)
    })
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
      $companies.edit({
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

          site.call('please add user', {
            email: companies_doc.username,
            password: companies_doc.password,
            roles: [{
              name: "companies"
            }],
            branch_list: [{
              company: companies_doc,
              branch: companies_doc.branch_list[0]
            }],
            companies_id: companies_doc.id,
            is_companies: true,
            profile: {
              name: companies_doc.name_ar,
              mobile: companies_doc.mobile,
              image_url: companies_doc.image_url
            }
          })

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

  site.post(["/api/companies/all"], (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (req.session.user.roles[0].name === 'companies') {
      where['id'] = req.session.user.companies_id;
    }

    $companies.findMany({
      select: req.body.select || {},
      where: req.body.where || {},
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