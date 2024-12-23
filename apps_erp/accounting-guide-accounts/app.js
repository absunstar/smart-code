module.exports = function init(site) {
  const $accounting_guide_accounts = site.connectCollection("accounting_guide_accounts")

  // $accounting_guide_accounts.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $accounting_guide_accounts.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => {

  //   })
  // })

  site.get({
    name: "accounting_guide_accounts",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  site.post("/api/accounting_guide_accounts/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let accounting_guide_accounts_doc = req.body
    accounting_guide_accounts_doc.$req = req
    accounting_guide_accounts_doc.$res = res
    accounting_guide_accounts_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    accounting_guide_accounts_doc.company = site.get_company(req)

    accounting_guide_accounts_doc.code_num = parseInt(accounting_guide_accounts_doc.code)

    let where = {}
    where['company.id'] = site.get_company(req).id

    let exit = false
    let code = 0
    let l = 0
    site.getDefaultSetting(req, settingDoc => {

      if (settingDoc) {


        l = accounting_guide_accounts_doc.length_level || 0
        $accounting_guide_accounts.findMany({
          where: where
        }, (err, docs, count) => {
          if (settingDoc.accounting.auto_generate_account_code_and_cost_center == true) {

            if (docs.length == 0) {
              accounting_guide_accounts_doc.code = addZero(1, l)
            } else {
              docs.forEach(el => {
                if (accounting_guide_accounts_doc.parent_id) {

                  if (accounting_guide_accounts_doc.parent_id === el.id
                    && accounting_guide_accounts_doc.parent_id != el.parent_id) {
                    accounting_guide_accounts_doc.code = accounting_guide_accounts_doc.code + addZero(1, l)

                  } else {
                    exit = true
                  }

                } else if (!el.parent_id) {
                  accounting_guide_accounts_doc.code = addZero((site.toNumber(el.code) + site.toNumber(1)), l)
                }
              })

              if (exit) {
                let c = 0
                let ss = ''
                docs.forEach(itm => {
                  if (itm.parent_id === accounting_guide_accounts_doc.parent_id) {
                    c += 1
                  }
                  if (itm.id === accounting_guide_accounts_doc.parent_id) {
                    ss = itm.code
                  }
                })
                code = (site.toNumber(c) + site.toNumber(1))
                accounting_guide_accounts_doc.code = ss + addZero(code, l)
              }
            }

            $accounting_guide_accounts.add(accounting_guide_accounts_doc, (err, doc) => {
              if (!err) {
                response.done = true
                response.doc = doc
              } else {
                response.error = err.message
              }
              res.json(response)
            })
          }

          if (settingDoc.accounting.auto_generate_account_code_and_cost_center == false && !accounting_guide_accounts_doc.code) {
            response.error = "enter tree code"
            res.json(response)
          } else {

            $accounting_guide_accounts.add(accounting_guide_accounts_doc, (err, doc) => {
              if (!err) {
                response.done = true
                response.doc = doc
              } else {
                response.error = err.message
              }
              res.json(response)
            })
          }

        })
      }
    })

  })

  site.post("/api/accounting_guide_accounts/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let id = req.body.id

    let accounting_guide_accounts_doc = req.body
    accounting_guide_accounts_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (accounting_guide_accounts_doc.id) {

      $accounting_guide_accounts.findMany({
        where: {
          parent_id: id
        }
      }, (err, docs, count) => {
        if (count > 0 && accounting_guide_accounts_doc.type == 'detailed') {
          response.error = 'Cant Change Detailed Err'
          res.json(response)
        } else {
          $accounting_guide_accounts.edit({
            where: {
              id: accounting_guide_accounts_doc.id
            },
            set: accounting_guide_accounts_doc,
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
        }
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/accounting_guide_accounts/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $accounting_guide_accounts.findOne({
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

  site.post("/api/accounting_guide_accounts/delete", (req, res) => {
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

      $accounting_guide_accounts.findMany({
        where: {
          parent_id: id
        }
      }, (err, docs, count) => {
        if (count > 0) {
          response.error = 'Cant Delete Acc Err'
          res.json(response)
        } else {
          $accounting_guide_accounts.delete({
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
        }
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/accounting_guide_accounts/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.data.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'name_Ar': site.get_RegExp(search, "i")
      })
      where.$or.push({
        'name_En': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'code': site.get_RegExp(search, "i")
      })

    }

    if (where['name_Ar']) {
      where['name_Ar'] = new RegExp(where['name_Ar'], 'i')
    }
    if (where['name_En']) {
      where['name_En'] = new RegExp(where['name_En'], 'i')
    }
    if (where['address']) {
      where['address'] = new RegExp(where['address'], 'i')
    }

    where['company.id'] = site.get_company(req).id



    $accounting_guide_accounts.findMany({
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

}