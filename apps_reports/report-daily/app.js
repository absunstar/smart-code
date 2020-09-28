module.exports = function init(site) {
  const $account_invoices = site.connectCollection("account_invoices")

  site.get({
    name: "report_daily",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.post("/api/report_daily/acc_invo", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}
    let currency = where.currency || {}
    let date1 = undefined
    let date_from = undefined
    let date_to = undefined
    let shift_code = undefined

    if (req.data.where) {
      if (req.data.where.date) date1 = new Date(req.data.where.date)
      if (req.data.where.date_from) date_from = new Date(req.data.where.date_from)
      if (req.data.where.date_to) date_to = new Date(req.data.where.date_to)
      if (req.data.where.shift_code) shift_code = req.data.where.shift_code
    }

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where['payment_list.date'] = {
        '$gte': d1,
        '$lte': d2
      }
      delete where.date
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where['payment_list.date'] = {
        '$gte': d1,
        '$lte': d2
      }
      delete where.date_from
      delete where.date_to
    }

    delete where['currency']


    if (where['shift_code']) {
      where['payment_list.shift.code'] = where['shift_code']
      delete where['shift_code']
    }

    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method']
    }

    if (where['source_type']) {
      where['source_type.id'] = where['source_type'].id;
      delete where['source_type']
    }

    if (where['order_daily_type']) {
      where['order_daily_type.id'] = where['order_daily_type'].id;
      delete where['order_daily_type']
    }

    where['posting'] = true
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $account_invoices.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {


        response.done = true

        let list = [{
          source_type: {
            id: 1,
            en: "Store In / Purchase Invoice",
            ar: "إذن وارد / فاتورة شراء"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 2,
            en: "Store In / Sales Invoice",
            ar: "إذن صرف / فاتورة مبيعات"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 3,
            en: "Orders Screen",
            ar: "شاشة الطلبات"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 4,
            en: "Orders Service",
            ar: "طلب خدمة"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 5,
            en: "Booking A Hall",
            ar: "حجز قاعة"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 6,
            en: "Trainer Account",
            ar: "حساب مدرب"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 7,
            en: "Form Course Booking",
            ar: "إستمارة حجز كورس"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 8,
            en: "Amount In",
            ar: "سند قبض"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 9,
            en: "Amount Out",
            ar: "سند صرف"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 10,
            en: "Recharge Customer Balance",
            ar: "دفعة عميل مقدمة"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 11,
            en: "Employee Advance",
            ar: "سلفة موظف"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 12,
            en: "Payment Employee Advance",
            ar: "تسديد سلفة موظف"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 13,
            en: "Cash In",
            ar: "كاش وارد"
          },
          paid_up: 0,
        },
        {
          source_type: {
            id: 14,
            en: "Cash Out",
            ar: "كاش منصرف"
          },
          paid_up: 0,
        },
        {
          source_type: {
            id: 15,
            en: "Bank In",
            ar: "بنك وارد"
          },
          paid_up: 0,
        },
        {
          source_type: {
            id: 16,
            en: "Bank Out",
            ar: "بنك منصرف"
          },
          paid_up: 0,
        }]


        docs.forEach(_doc => {
          _doc.payment_list.forEach(_p_l => {
            if (_p_l.payment_method && _p_l.currency && currency.id == _p_l.currency.id) {

              let numIn = 0
              let numOut = 0
              if (_p_l.payment_method.id == 1) {
                numIn = 12
                numOut = 13
              } else {
                numIn = 14
                numOut = 15
              }

              if ((_p_l.shift && shift_code == _p_l.shift.code) || (date1 && new Date(_p_l.date) >= new Date(date1) && new Date(_p_l.date) <= date1.setDate(date1.getDate() + 1)) || new Date(_p_l.date) <= new Date(date_to) && new Date(_p_l.date) >= new Date(date_from)) {

                _doc.shift = _p_l.shift
                _doc.date = _p_l.date
                _doc.safe = _p_l.safe
                _doc.payment_method = _p_l.payment_method
                _doc.currency = _p_l.currency
                _doc.paid_up = _p_l.paid_up
                if (_doc.source_type) {
                  if (_doc.source_type.id == 1) {

                    if (_doc.invoice_type && _doc.invoice_type.id == 4) {
                      list[0].paid_up = list[0].paid_up - _p_l.paid_up
                      list[numIn].paid_up = list[numIn].paid_up - _p_l.paid_up
                    } else {
                      list[0].paid_up = list[0].paid_up + _p_l.paid_up
                      list[numIn].paid_up = list[numIn].paid_up + _p_l.paid_up
                    }
                    list[0].invoices_list.push(_doc)

                  } else if (_doc.source_type.id == 2) {

                    if (_doc.invoice_type && _doc.invoice_type.id == 6) {
                      list[1].paid_up = list[1].paid_up - _p_l.paid_up
                      list[numOut].paid_up = list[numOut].paid_up - _p_l.paid_up
                    } else {
                      list[1].paid_up = list[1].paid_up + _p_l.paid_up
                      list[numOut].paid_up = list[numOut].paid_up + _p_l.paid_up
                    }
                    list[1].invoices_list.push(_doc)

                  } else if (_doc.source_type.id == 3) {
                    list[numIn].paid_up = list[numIn].paid_up + _p_l.paid_up

                    list[2].paid_up = list[2].paid_up + _p_l.paid_up
                    list[2].invoices_list.push(_doc)

                  } else if (_doc.source_type.id == 4) {

                    list[numIn].paid_up = list[numIn].paid_up + _p_l.paid_up
                    list[3].paid_up = list[3].paid_up + _p_l.paid_up
                    list[3].invoices_list.push(_doc)

                  } else if (_doc.source_type.id == 8) {

                    list[numIn].paid_up = list[numIn].paid_up + _p_l.paid_up
                    list[7].paid_up = list[7].paid_up + _p_l.paid_up
                    list[7].invoices_list.push(_doc)

                  } else if (_doc.source_type.id == 9) {

                    list[numIn].paid_up = list[numIn].paid_up + _p_l.paid_up
                    list[8].paid_up = list[8].paid_up + _p_l.paid_up
                    list[8].invoices_list.push(_doc)

                  } else if (_doc.source_type.id == 10) {

                    list[numIn].paid_up = list[numIn].paid_up + _p_l.paid_up
                    list[9].paid_up = list[9].paid_up + _p_l.paid_up
                    list[9].invoices_list.push(_doc)

                  } else if (_doc.source_type.id == 11) {

                    list[numOut].paid_up = list[numOut].paid_up + _p_l.paid_up
                    list[10].paid_up = list[10].paid_up + _p_l.paid_up
                    list[10].invoices_list.push(_doc)

                  } else if (_doc.source_type.id == 12) {

                    list[numIn].paid_up = list[numIn].paid_up + _p_l.paid_up
                    list[11].paid_up = list[11].paid_up + _p_l.paid_up
                    list[11].invoices_list.push(_doc)

                  }
                }
              }
            }

          });
        })

        response.list = list
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.post("/api/report_daily/store_invo", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    
    site.getStoresIn(Object.assign({}, where), storeInList => {
      site.getStoresOut(Object.assign({}, where), storeOutList => {
        site.gettransferBranch(Object.assign({}, where), transBranchList => {
          site.getStoresAssemble(Object.assign({}, where), storesAssembleList => {
            site.getStoresDismantle(Object.assign({}, where), storesDismantleList => {
              site.getUnitSwitch(Object.assign({}, where), unitSwitchList => {
                site.getStoreStock(Object.assign({}, where), storeStockList => {

                  response.done = true

                  let list = [{

                    list: storeInList,
                    source_type: {
                      id: 1,
                      en: "Stores In / Purchase Invoice",
                      ar: "إذن وارد / فاتورة شراء"
                    }
                  }, {
                    list: storeOutList,
                    source_type: {
                      id: 2,
                      en: "Stores Out / Sales Invoice",
                      ar: "إذن صرف / فاتورة بيع"
                    }
                  }, {
                    list: transBranchList,
                    source_type: {
                      id: 3,
                      en: "Stores Transfer",
                      ar: "التحويلات المخزنية"
                    }
                  }, {
                    list: storesAssembleList,
                    source_type: {
                      id: 4,
                      en: "Items Assemble",
                      ar: "تجميع الأصناف"
                    }
                  }, {
                    list: storesDismantleList,
                    source_type: {
                      id: 5,
                      en: "Items Dismantle",
                      ar: "تفكيك الأصناف"
                    }
                  }, {
                    list: unitSwitchList,
                    source_type: {
                      id: 6,
                      en: "UnitS Switch",
                      ar: "تحويل الوحدات"
                    }
                  }, {
                    list: storeStockList,
                    source_type: {
                      id: 7,
                      en: "Stores Stock",
                      ar: "الجرد المخزني"
                    }
                  }]

                  response.list = list
                  res.json(response)
                })
              })
            })
          })
        })
      })
    })

  })


}