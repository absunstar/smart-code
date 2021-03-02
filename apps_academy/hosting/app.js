module.exports = function init(site) {
  const $hosting = site.connectCollection("hosting")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post({
    name: "/api/times_hosting/all",
    path: __dirname + "/site_files/json/times_hosting.json"

  })

  site.post({
    name: "/api/host_list/all",
    path: __dirname + "/site_files/json/host.json"

  })

  site.get({
    name: "hosting",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/hosting/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let hosting_doc = req.body
    hosting_doc.$req = req
    hosting_doc.$res = res

    hosting_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof hosting_doc.active === 'undefined') {
      hosting_doc.active = true
    }

    hosting_doc.company = site.get_company(req)
    hosting_doc.branch = site.get_branch(req)

    hosting_doc.total_required = 0
    hosting_doc.student_list.forEach(s => {
      hosting_doc.total_required += s.price
    });

    $hosting.add(hosting_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/hosting/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let hosting_doc = req.body

    hosting_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    hosting_doc.total_required = 0
    hosting_doc.student_list.forEach(s => {
      hosting_doc.total_required += s.price
    });

    if (hosting_doc.id) {
      $hosting.edit({
        where: {
          id: hosting_doc.id
        },
        set: hosting_doc,
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

  site.post("/api/hosting/update_paid", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let hosting_doc = req.body

    hosting_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (hosting_doc.id) {
      $hosting.edit({
        where: {
          id: hosting_doc.id
        },
        set: hosting_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err && result) {
          response.done = true
          response.doc = result.doc
          if (response.doc.safe) {

            let paid_value = {
              value: response.doc.baid_go,
              source_name_ar: response.doc.student_paid.name_ar,
              source_name_en: response.doc.student_paid.name_en,
              company: response.doc.company,
              branch: response.doc.branch,
              date: response.doc.date_paid,
              shift: {
                id: result.doc.shift.id,
                code: result.doc.shift.code,
                name_ar: result.doc.shift.name_ar, name_en: result.doc.shift.name_en
              },
              transition_type: 'in',
              operation: { ar: 'دفعة إستضافة', en: 'Pay Hosting' },

              safe: response.doc.safe
            }
            site.quee('[amounts][safes][+]', paid_value)
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

  site.post("/api/hosting/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $hosting.findOne({
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

  site.post("/api/hosting/delete", (req, res) => {
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
      $hosting.delete({
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

  site.post("/api/hosting/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code


    $hosting.findMany({
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