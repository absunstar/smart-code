module.exports = function init(site) {
  const $accounting_cost_centers = site.connectCollection("accounting_cost_centers")

  $accounting_cost_centers.deleteDuplicate({
    code: 1,
    'company.id': 1
  }, (err, result) => {
    $accounting_cost_centers.createUnique({
      code: 1,
      'company.id': 1
    }, (err, result) => { })
  })

  site.get({
    name: "accounting_cost_centers",
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

  site.post("/api/accounting_cost_centers/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let accounting_cost_centers_doc = req.body
    accounting_cost_centers_doc.$req = req
    accounting_cost_centers_doc.$res = res
    accounting_cost_centers_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    accounting_cost_centers_doc.company = site.get_company(req)

    accounting_cost_centers_doc.code_num = parseInt(accounting_cost_centers_doc.code)

    let where = {}
    where['company.id'] = site.get_company(req).id

    let exit = false
    let code = 0
    let l = 0
    site.getDefaultSetting(req, settingDoc => {

      if (settingDoc) {

        l = settingDoc.accounting.length_level || 0
        $accounting_cost_centers.findMany({
          where: where
        }, (err, docs, count) => {
          if (settingDoc.accounting.auto_generate_account_code_and_cost_center == true) {

            if (docs.length == 0) {
              accounting_cost_centers_doc.code = addZero(1, l)
            } else {
              docs.forEach(el => {
                if (accounting_cost_centers_doc.parent_id) {

                  if (accounting_cost_centers_doc.parent_id === el.id
                    && accounting_cost_centers_doc.parent_id != el.parent_id) {
                    accounting_cost_centers_doc.code = accounting_cost_centers_doc.code + addZero(1, l)

                  } else {
                    exit = true
                  }

                } else if (!el.parent_id) {
                  accounting_cost_centers_doc.code = addZero((site.toNumber(el.code) + site.toNumber(1)), l)
                }
              });

              if (exit) {
                let c = 0;
                let ss = '';
                docs.forEach(itm => {
                  if (itm.parent_id === accounting_cost_centers_doc.parent_id) {
                    c += 1
                  }
                  if (itm.id === accounting_cost_centers_doc.parent_id) {
                    ss = itm.code
                  }
                })
                code = (site.toNumber(c) + site.toNumber(1))
                accounting_cost_centers_doc.code = ss + addZero(code, l)
              }
            }

            $accounting_cost_centers.add(accounting_cost_centers_doc, (err, doc) => {
              if (!err) {
                response.done = true
                response.doc = doc
              } else {
                response.error = err.message
              }
              res.json(response)
            })
          }

          if (settingDoc.accounting.auto_generate_account_code_and_cost_center == false && !accounting_cost_centers_doc.code) {
            response.error = "enter tree code"
            res.json(response)
          } else {

            $accounting_cost_centers.add(accounting_cost_centers_doc, (err, doc) => {
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

  site.post("/api/accounting_cost_centers/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id
    let accounting_cost_centers_doc = req.body

    accounting_cost_centers_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (accounting_cost_centers_doc.id) {
      $accounting_cost_centers.findMany({
        where: {
          parent_id: id
        }
      }, (err, docs, count) => {
        if (count > 0 && accounting_cost_centers_doc.type == 'detailed') {
          response.error = 'Cant Change Detailed Err'
          res.json(response)
        } else {
          $accounting_cost_centers.edit({
            where: {
              id: accounting_cost_centers_doc.id
            },
            set: accounting_cost_centers_doc,
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

  site.post("/api/accounting_cost_centers/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $accounting_cost_centers.findOne({
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

  site.post("/api/accounting_cost_centers/delete", (req, res) => {
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
      $accounting_cost_centers.findMany({
        where: {
          parent_id: id
        }
      }, (err, docs, count) => {
        if (count > 0) {
          response.error = 'Cant Delete Acc Err'
          res.json(response)
        } else {
          $accounting_cost_centers.delete({
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

  site.post("/api/accounting_cost_centers/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.data.where || {}

    if (where['name_ar']) {
      where['name_ar'] = new RegExp(where['name_ar'], 'i')
    }

    if (where['name_en']) {
      where['name_en'] = new RegExp(where['name_en'], 'i')
    }

    if (where['address']) {
      where['address'] = new RegExp(where['address'], 'i')
    }

    where['company.id'] = site.get_company(req).id

    $accounting_cost_centers.findMany({
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