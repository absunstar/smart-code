module.exports = function init(site) {
  const $numbering_transactions = site.connectCollection("numbering_transactions")
  const $financial_years = site.connectCollection("financial_years")

  site.on('mongodb after delete', (itm) => {

    const $temp = site.connectCollection(itm.collection)

    $temp.findMany({
      sort: {
        id: -1
      }
    }, (err, docs, count) => {
      if (count > 0) {

        let number = site.numberingList.find(el => el.company.id == itm.doc.company.id)

        number.modules_list.forEach(m => {

          m.transactions_names_list.forEach(t => {

            if (t.name == itm.collection) {
              t.current_value = docs[0].code

              $numbering_transactions.update({
                where: {
                  'company.id': itm.doc.company.id
                },
                set: number
              }, (e, r) => {
                site.reload_numbering();
              })

            }
          })
        })
      } else {
        let number = site.numberingList.find(el => el.company.id == itm.doc.company.id)

        number.modules_list.forEach(m => {

          m.transactions_names_list.forEach(t => {

            if (t.name == itm.collection) {
              t.current_value = t.value - 1

              $numbering_transactions.update({
                where: {
                  'company.id': itm.doc.company.id
                },
                set: number
              }, (e, r) => {
                site.reload_numbering();
              })

            }
          })
        })
      }
    })

  })

  $numbering_transactions.deleteDuplicate({
    code: 1,
    'company.id': 1
  }, (err, result) => {
    $numbering_transactions.createUnique({
      code: 1,
      'company.id': 1
    }, (err, result) => { })
  })

  site.numbering = {};
  site.numberingList = [];

  site.financial_year = function (itm, callback) {

    callback = callback || {}

    $financial_years.findMany({
      select: {},
      where: {
        'active': true,
        'status.id': {
          $ne: 3
        },
        'company.id': itm.company.id
      },
      sort: {
        id: -1
      },
      limit: 1000
    }, (err, docs2, count) => {
      docs2 = docs2 || []
      itm.modules_list.forEach(m => {
        if (!m.transaction_number) {
          /*  m.transaction_number = 'connected';*/
        }
        m.transactions_names_list.forEach(t => {

          if (!t.value) {
            t.value = 1
            t.current_value = 0
          }
          t.financial_years_list = t.financial_years_list || []

          docs2.forEach(y => {
            y2 = {
              code: y.code,
              name: y.name,
              status: y.status,
              value: 1,
              current_value: 0,
              accounting_period_list: []
            };

            let exist = false
            t.financial_years_list.forEach(y3 => {
              if (y2.code == y3.code) {
                exist = true
              }
            })

            if (!exist) {
              t.financial_years_list.push(y2);
              y.accounting_period_list.forEach((p, i) => {
                y2.accounting_period_list.push({
                  code: y.code + '_' + i,
                  start: p.start,
                  value: 1,
                  current_value: 0
                })
              })
            }

          })
        })
      })
      callback(err, itm)

    })
  }

  site.reload_numbering = function () {

    $numbering_transactions.findMany({
      select: {},
      where: {},
      sort: { id: -1 }
    }, (err, docs, count) => {

      if (!err && docs) {
        site.numberingList = docs
        site.numberingList.forEach(itm => {
          site.financial_year(itm, (err, doc) => {
            itm = doc
          });
        });
      }

    })
  }

  site.reload_numbering();

  site.get_new_code = function (req, module_id, transaction_id) {

    let code = null

    site.reload_numbering();

    let number = site.numberingList.find(el => el.company.id == site.get_company(req).id)

    number.modules_list.forEach(m => {

      if (m.id == module_id) {

        if (m.transaction_system == 'auto') {
          m.transactions_names_list.forEach(t => {
            if (t.id == transaction_id && t.type == 'transactions') {
              if (m.transaction_number == 'connected') {
                if (t.current_value) {
                  t.current_value++

                } else {
                  t.current_value = 1
                }
                $numbering_transactions.update({
                  where: {
                    'company.id': site.get_company(req).id
                  },
                  set: number
                }, (e, r) => { site.reload_numbering(); })
                code = t.current_value
              } else if (m.transaction_number == 'year') {
                t.financial_years_list.forEach((year, i) => {
                  if (i == 0) {
                    if (year.current_value) {
                      year.current_value++
                    } else {
                      year.current_value = 1
                    }
                    $numbering_transactions.update({
                      where: {
                        'company.id': site.get_company(req).id
                      },
                      set: number
                    }, (e, r) => { site.reload_numbering(); })
                    code = year.current_value
                  }
                })

              } else if (m.transaction_number == 'period') {
                t.financial_years_list.forEach((year, i) => {
                  if (i == 0) {
                    year.accounting_period_list.forEach((period, i2) => {
                      if (i2 === 0) {
                        if (period.current_value) {
                          period.current_value++
                        } else {
                          period.current_value = 1
                        }
                        $numbering_transactions.update({
                          where: {
                            id: 1
                          },
                          set: number
                        }, (e, r) => { site.reload_numbering(); })
                        code = period.current_value
                      }
                    })

                  }
                })

              } else {
                code = null
              }
            }
          })
        }

        if (m.transaction_files_system == 'auto') {
          m.transactions_names_list.forEach(t => {
            if (t.id == transaction_id && t.type == 'files') {

              if (t.current_value) {
                t.current_value++
              } else {
                t.current_value = 1
              }
              $numbering_transactions.update({
                where: {
                  'company.id': site.get_company(req).id
                },
                set: number
              }, (e, r) => { site.reload_numbering(); })

              code = t.current_value

            }
          })
        }

      }

    })

    return code
  }

  site.get({
    name: "numbering_transactions",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post({
    name: "/api/modules_list/all",
    path: __dirname + "/site_files/json/modules_list.json"
  })

  site.post({
    name: "/api/numbering_types/all",
    path: __dirname + "/site_files/json/numbering_types.json"
  })

  site.post("/api/numbering_transactions/get", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }


    $numbering_transactions.get({
      where: {
        'company.id': site.get_company(req).id
      }
    }, (err, doc, count) => {
      response.done = true
      if (!err && doc) {
        site.financial_year(doc, (err, doc2) => {
          response.doc = doc2
          res.json(response)
        })
      } else {
        /*
        let itm={};
        itm.modules_list = JSON.parse(site.readFileSync(__dirname + '/site_files/json/modules_list.json'))
        itm.numbering_type_list = JSON.parse(site.readFileSync(__dirname + '/site_files/json/numbering_types.json'))
        
        site.financial_year(itm,(err,doc)=>{
          response.doc =doc
          res.json(response)
        })
*/
        $numbering_transactions.add(
          {

            "modules_list": JSON.parse(site.readFileSync(__dirname + '/site_files/json/modules_list.json')),
            "company": site.get_company(req)
          }, (errr, new_doc) => {
            site.financial_year(new_doc, (err, doct) => {
              response.doc = doct
              res.json(response)
            })
          })
      }

    })

  })

  site.post("/api/numbering_transactions/save", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let numbering = req.data

    numbering['company'] = site.get_company(req)

    $numbering_transactions.get({
      where: {
        'company.id': site.get_company(req).id
      }
    }, (err, doc) => {

      if (!err && doc) {
        $numbering_transactions.update({
          where: {
            'company.id': site.get_company(req).id
          },
          set: numbering
        }, (err, result) => {
          if (!err) {
            response.result = result
            response.done = true
            site.reload_numbering();
            res.json(response)
          } else {
            response.error = err.message
            res.json(response)
          }
        })
      } else {
        $numbering_transactions.add(
          numbering, (err, new_doc) => {
            if (!err) {
              response.result = new_doc
              response.done = true
              site.reload_numbering();
              res.json(response)
            } else {
              response.error = err.message
              res.json(response)
            }
          })
      }
    })

  })

  site.post("/api/numbering_transactions_status/get", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    response.done = true

    let list = []

    site.reload_numbering();

    let number = site.numberingList.find(el => el.company.id == site.get_company(req).id)
    if (number) {
      number.modules_list.forEach(modules => {
        modules.transactions_names_list.forEach(screen => {
          if (screen.type == 'transactions') {

            screen.transaction_system = modules.transaction_system ? modules.transaction_system : 'auto';
          } else {

            screen.transaction_system = modules.transaction_files_system ? modules.transaction_files_system : "auto";
          }
          list.push(screen);
        })
      })

      response.doc = list.find(el => el.name == req.data.screen_name).transaction_system

    } else {
      response.doc = 'auto'
    }

    res.json(response)

  })

  site.changeNumberFinancial = function (option, callback) {

    callback = callback || function () { }

    $numbering_transactions.findOne({
      where: {
        'company.id': site.get_company(option.req).id,

        'branch.code': site.get_branch(option.req).code,
        'modules_list.transactions_names_list.financial_years_list.code': option.code
      }
    }, (err2, doc2) => {

      doc2.modules_list.forEach(item => {
        item.transactions_names_list.forEach(itm => {
          if (itm.transaction_number == 'period' || itm.transaction_number == 'year') {
            itm.financial_years_list.forEach(i => {
              if (i.code == option.code) {
                i.status = option.status
                i.accounting_period_list = option.accounting_period_list
              }
            })
          }

        })
      })

      $numbering_transactions.edit({
        where: {
          id: doc2.id
        },
        set: doc2
      }, (err, doc) => {
        callback(err, doc)

      })
    })


    return true

  }
}