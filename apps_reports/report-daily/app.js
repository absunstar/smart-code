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
    let get_date = undefined
    let date_from = undefined
    let date_to = undefined
    let shift_code = undefined

    if (req.data.where) {
      if (req.data.where.date){
        date1 = site.toDate(req.data.where.date)
        get_date = site.toDate(req.data.where.date)
        get_date.setDate(get_date.getDate() + 1)
      }

      if (req.data.where.date_from) date_from = site.toDate(req.data.where.date_from)
      if (req.data.where.date_to) date_to = site.toDate(req.data.where.date_to)
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
        '$lt': d2
      }
      delete where.date
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where['payment_list.date'] = {
        '$gte': d1,
        '$lt': d2
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
            En: "Store In / Purchase Invoice",
            Ar: "إذن وارد / فاتورة شراء"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 2,
            En: "Store In / Sales Invoice",
            Ar: "إذن صرف / فاتورة مبيعات"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 3,
            En: "Orders Screen",
            Ar: "شاشة الطلبات"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 4,
            En: "Orders Service",
            Ar: "طلب نشاط"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 5,
            En: "Booking A Hall",
            Ar: "حجز قاعة"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 6,
            En: "Trainer Account",
            Ar: "حساب مدرب"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 7,
            En: "Form Course Booking",
            Ar: "إستمارة حجز كورس"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 8,
            En: "Amount In",
            Ar: "سند قبض"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 9,
            En: "Amount Out",
            Ar: "سند صرف"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 10,
            En: "Customer Advance Payment",
            Ar: "دفعة عميل مقدمة"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 11,
            En: "Employee Advance",
            Ar: "سلفة موظف"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 12,
            En: "Payment Employee Advance",
            Ar: "تسديد سلفة موظف"
          },
          paid_up: 0,
          invoices_list: []
        },
        {
          source_type: {
            id: 13,
            En: "Monetary In",
            Ar: "نقدي وارد"
          },
          paid_up: 0,
        },
        {
          source_type: {
            id: 14,
            En: "Monetary Out",
            Ar: "نقدي منصرف"
          },
          paid_up: 0,
        },
        {
          source_type: {
            id: 15,
            En: "Bank In",
            Ar: "بنك وارد"
          },
          paid_up: 0,
        },
        {
          source_type: {
            id: 16,
            En: "Bank Out",
            Ar: "بنك منصرف"
          },
          paid_up: 0,
        }]


        docs.forEach(_doc => {
          if (_doc.payment_list && _doc.payment_list.length > 0) {

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
                if ((_p_l.shift && shift_code == _p_l.shift.code) || ((date1 && site.toDate(_p_l.date) >= site.toDate(date1) && site.toDate(_p_l.date) <= site.toDate(get_date) )) || (site.toDate(_p_l.date) <= site.toDate(date_to) && site.toDate(_p_l.date) >= site.toDate(date_from))) {

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
                        list[numOut].paid_up = list[numOut].paid_up - _p_l.paid_up
                      } else {
                        list[0].paid_up = list[0].paid_up + _p_l.paid_up
                        list[numOut].paid_up = list[numOut].paid_up + _p_l.paid_up
                      }
                      list[0].invoices_list.push(_doc)

                    } else if (_doc.source_type.id == 2) {

                      if (_doc.invoice_type && _doc.invoice_type.id == 6) {
                        list[1].paid_up = list[1].paid_up - _p_l.paid_up
                        list[numIn].paid_up = list[numIn].paid_up - _p_l.paid_up
                      } else {
                        list[1].paid_up = list[1].paid_up + _p_l.paid_up
                        list[numIn].paid_up = list[numIn].paid_up + _p_l.paid_up
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

                      list[numOut].paid_up = list[numOut].paid_up + _p_l.paid_up
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
          }

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
    delete where.currency


    site.getStoresIn(Object.assign({}, where), storeInList => {
      site.getStoresOut(Object.assign({}, where), storeOutList => {
        site.getTransferBranch(Object.assign({}, where), transBranchList => {
          site.getStoresAssemble(Object.assign({}, where), storesAssembleList => {
            site.getStoresDismantle(Object.assign({}, where), storesDismantleList => {
              site.getUnitSwitch(Object.assign({}, where), unitSwitchList => {
                site.getStoreStock(Object.assign({}, where), storeStockList => {

                  response.done = true

                  let list = [{

                    list: storeInList,
                    source_type: {
                      id: 1,
                      En: "Stores In / Purchase Invoice",
                      Ar: "إذن وارد / فاتورة شراء"
                    }
                  }, {
                    list: storeOutList,
                    source_type: {
                      id: 2,
                      En: "Stores Out / Sales Invoice",
                      Ar: "إذن صرف / فاتورة بيع"
                    }
                  }, {
                    list: transBranchList,
                    source_type: {
                      id: 3,
                      En: "Stores Transfer",
                      Ar: "التحويلات المخزنية"
                    }
                  }, {
                    list: storesAssembleList,
                    source_type: {
                      id: 4,
                      En: "Items Assemble",
                      Ar: "تجميع الأصناف"
                    }
                  }, {
                    list: storesDismantleList,
                    source_type: {
                      id: 5,
                      En: "Items Dismantle",
                      Ar: "تفكيك الأصناف"
                    }
                  }, {
                    list: unitSwitchList,
                    source_type: {
                      id: 6,
                      En: "UnitS Switch",
                      Ar: "تحويل الوحدات"
                    }
                  }, {
                    list: storeStockList,
                    source_type: {
                      id: 7,
                      En: "Stores Stock",
                      Ar: "الجرد المخزني"
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



  site.post("/api/report_daily/personnel", (req, res) => {
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
    delete where.currency

    site.getEmployeesOffers(Object.assign({}, where), employeesOffersList => {
      site.getEmployeesDiscounts(Object.assign({}, where), employeesDiscountsList => {
        site.getEmployees(Object.assign({}, where), attendLeaveList => {

          response.done = true
          empOfferPay = 0
          empDisPay = 0
          if (employeesOffersList && employeesOffersList.length > 0) {
            employeesOffersList.forEach(_empOffer => {
              empOfferPay += _empOffer.value
            });
          }

          if (employeesDiscountsList && employeesDiscountsList.length > 0) {
            employeesDiscountsList.forEach(_empDis => {
              empDisPay += _empDis.value
            });
          }

          let list = [{
            list: employeesOffersList,
            paid_up: empOfferPay,
            source_type: {
              id: 1,
              En: "Employees Offers",
              Ar: "مكافاّت الموظفين"
            }
          }, {
            list: employeesDiscountsList,
            paid_up: empDisPay,
            source_type: {
              id: 2,
              En: "Employees Discounts",
              Ar: "خصومات الموظفين"
            }
          }, {

            list: attendLeaveList,
            source_type: {
              id: 3,
              En: "Attend & Leave",
              Ar: "حضور و إنصراف"
            }
          }]

          response.list = list
          res.json(response)
        })
      })
    })

  })




}