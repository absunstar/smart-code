module.exports = function init(site) {
  const $account_invoices = site.connectCollection("account_invoices")

  site.on('[stores_items][item_name][change]', objectInvoice => {

    let barcode = objectInvoice.sizes_list.map(_obj => _obj.barcode)

    $account_invoices.findMany({ 'company.id': objectInvoice.company.id, 'current_book_list.barcode': barcode }, (err, doc) => {
      if (doc) {

        doc.forEach(_doc => {
          if (_doc.current_book_list)
            _doc.current_book_list.forEach(_items => {
              objectInvoice.sizes_list.forEach(_size => {
                if (_items.barcode === _size.barcode) {
                  _items.size = _size.size
                  _items.size_en = _size.size_en
                }
              })
            });
          $account_invoices.update(_doc);
        });
      }
    });
  });


  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  $account_invoices.newCode = function () {

    let y = new Date().getFullYear().toString().substr(2, 2)
    let m = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][new Date().getMonth()].toString()
    let d = new Date().getDate()
    let lastCode = site.storage('ticket_last_code') || 0
    let lastMonth = site.storage('ticket_last_month') || m
    if (lastMonth != m) {
      lastMonth = m
      lastCode = 0
    }
    lastCode++
    site.storage('ticket_last_code', lastCode)
    site.storage('ticket_last_month', lastMonth)
    return y + lastMonth + addZero(d, 2) + addZero(lastCode, 4)
  }

  site.get({
    name: "account_invoices",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post({
    name: "/api/source_type/all",
    path: __dirname + "/site_files/json/source_type.json"
  })

  site.post({
    name: "/api/payment_method/all",
    path: __dirname + "/site_files/json/payment_method.json"
  })

  site.post("/api/account_invoices/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let account_invoices_doc = req.body;
    account_invoices_doc.$req = req;
    account_invoices_doc.$res = res;
    account_invoices_doc.company = site.get_company(req);
    account_invoices_doc.branch = site.get_branch(req);
    account_invoices_doc.code = $account_invoices.newCode();
    account_invoices_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (account_invoices_doc.paid_up && account_invoices_doc.safe) {
      if (!account_invoices_doc.payment_list || (account_invoices_doc.payment_list && account_invoices_doc.payment_list.length < 1))
        account_invoices_doc.payment_list = [{
          date: account_invoices_doc.date,
          posting: account_invoices_doc.posting ? true : false,
          safe: account_invoices_doc.safe,
          payment_method: account_invoices_doc.payment_method,
          currency: account_invoices_doc.currency,
          paid_up: account_invoices_doc.paid_up
        }]
    };

    account_invoices_doc.total_paid_up = 0
    account_invoices_doc.remain_amount = 0

    if (account_invoices_doc.paid_up) {
      account_invoices_doc.total_paid_up = site.toNumber(account_invoices_doc.paid_up)

      if (account_invoices_doc.currency)
        account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.net_value) - (account_invoices_doc.total_paid_up * site.toNumber(account_invoices_doc.currency.ex_rate))
    } else account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.net_value)
    account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.remain_amount)

    if (account_invoices_doc.source_type.id == 8) account_invoices_doc.remain_amount = 0

    $account_invoices.add(account_invoices_doc, (err, doc) => {

      if (!err) {
        response.done = true;
        response.doc = doc;

        if (doc.source_type.id == 1) site.call('[store_in][account_invoice][invoice]', doc.invoice_id)
        else if (doc.source_type.id == 2) site.call('[store_out][account_invoice][invoice]', doc.invoice_id)


        if (doc.posting) {

          let paid_value = {
            value: doc.paid_up,
            company: doc.company,
            branch: doc.branch,
            date: doc.date,
            code: doc.code,
            image_url: doc.image_url,
            payment_method: doc.payment_method,
            currency: doc.currency,
            safe: doc.safe,
            shift: {
              id: doc.shift.id,
              code: doc.shift.code,
              name: doc.shift.name
            }
          }

          if (doc.source_type.id == 1) {

            if (doc.invoice_type && doc.invoice_type.id == 4) {
              paid_value.value = (-Math.abs(paid_value.value))
              paid_value.operation = { ar: ' مرتجع فاتورة مشتريات', en: 'Return Purchase Invoice' }

            } else {
              paid_value.operation = { ar: 'فاتورة مشتريات', en: 'Purchase Invoice' }
            }

            paid_value.transition_type = 'out'


          } else if (doc.source_type.id == 2) {

            if (doc.invoice_type && doc.invoice_type.id == 6) {
              paid_value.value = (-Math.abs(paid_value.value))
              paid_value.operation = { ar: 'مرتجع فاتورة مبيعات', en: 'Return Sales Invoice' }
              if (doc.payment_method && doc.payment_method.id == 5) {
                let customerPay = doc.paid_up * doc.currency.ex_rate
                let customerBalance = {
                  id: doc.customer.id,
                  paid_up: customerPay,
                  sum: true
                }
                site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
              }

            } else {
              paid_value.operation = { ar: 'فاتورة مبيعات', en: 'Sales Invoice' }
              if (doc.payment_method && doc.payment_method.id == 5) {

                let customerPay = doc.paid_up * doc.currency.ex_rate
                let customerBalance = {
                  id: doc.customer.id,
                  paid_up: customerPay,
                  minus: true
                }
                site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))

              }
            }
            paid_value.transition_type = 'in'

          } else if (doc.source_type.id == 3) {
            paid_value.operation = { ar: 'فاتورة شاشة الطلبات', en: 'Orders Screen Invoice' }
            paid_value.transition_type = 'in'
            let under_paid = {
              book_list: doc.current_book_list,
              net_value: doc.net_value,
              total_tax: doc.total_tax,
              total_discount: doc.total_discount,
              price_delivery_service: doc.price_delivery_service,
              service: doc.service,
              invoice_id: doc.invoice_id
            }
            site.call('[account_invoices][order_invoice][+]', Object.assign({}, under_paid))

          } else if (doc.source_type.id == 4) {
            paid_value.operation = { ar: 'فاتورة طلب خدمة', en: 'Request Service Invoice' }
            paid_value.transition_type = 'in'
            site.call('[account_invoices][request_service][+]', Object.assign({}, doc.invoice_id))

          } else if (doc.source_type.id == 5) {
            paid_value.operation = { ar: 'فاتورة حجز قاعة', en: 'Book Hall Invoice' }
            paid_value.transition_type = 'in'
            site.call('[account_invoices][book_hall][+]', Object.assign({}, doc.invoice_id))

          } else if (doc.source_type.id == 8) {
            paid_value.operation = { ar: 'شحن رصيد عميل', en: 'Recharge Customer Balance' }
            paid_value.transition_type = 'in'
            let customerPay = doc.paid_up * doc.currency.ex_rate
            let customerBalance = {
              id: doc.customer.id,
              paid_up: customerPay,
              sum: true
            }
            site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
          }

          if (doc.safe) site.call('[amounts][safes][+]', Object.assign({}, paid_value))
        }

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/account_invoices/update_payment", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let account_invoices_doc = req.body
    account_invoices_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    account_invoices_doc.total_paid_up = 0

    account_invoices_doc.payment_list.forEach(_payment_list => {
      if (_payment_list.currency)
        account_invoices_doc.total_paid_up += (_payment_list.paid_up * _payment_list.currency.ex_rate)

      if (!_payment_list.posting) {
        _payment_list.posting = true

        let paid_value = {
          value: _payment_list.paid_up,
          company: account_invoices_doc.company,
          branch: account_invoices_doc.branch,
          code: account_invoices_doc.code,
          date: _payment_list.date,
          image_url: account_invoices_doc.image_url,
          safe: _payment_list.safe,
          payment_method: _payment_list.payment_method,
          currency: _payment_list.currency,
          shift: {
            id: account_invoices_doc.shift.id,
            code: account_invoices_doc.shift.code,
            name: account_invoices_doc.shift.name
          }
        }

        if (account_invoices_doc.source_type.id == 1) {


          if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 4) {

            paid_value.operation = { ar: 'دفعة مرتجع فاتورة مشتريات', en: 'Pay Return Purchase Invoice' }
            paid_value.value = (-Math.abs(paid_value.value))
          } else {

            paid_value.operation = { ar: 'دفعة فاتورة مشتريات', en: 'Pay Purchase Invoice' }
          }

          paid_value.transition_type = 'out'

        }

        else if (account_invoices_doc.source_type.id == 2) {

          if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 6) {

            paid_value.operation = { ar: 'دفعة مرتجع فاتورة مبيعات', en: 'Pay Return Sales Invoice' }
            paid_value.value = (-Math.abs(paid_value.value))
            if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {
              let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate

              let customerBalance = {
                id: account_invoices_doc.customer.id,
                paid_up: customerPay,
                sum: true
              }
              site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
            }

          } else {

            paid_value.operation = { ar: 'دفعة فاتورة مبيعات', en: 'Pay Sales Invoice' }
            if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {
              let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate

              let customerBalance = {
                id: account_invoices_doc.customer.id,
                paid_up: customerPay,
                minus: true
              }
              site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
            }
          }

          paid_value.transition_type = 'in'


        } else if (account_invoices_doc.source_type.id == 3) {
          paid_value.operation = { ar: ' دفعة فاتورة شاشة الطلبات', en: 'Pay Orders Return Screen Invoice' }
          paid_value.transition_type = 'in'

        } else if (account_invoices_doc.source_type.id == 4) {
          paid_value.operation = { ar: 'دفعة فاتورة طلب خدمة', en: 'Pay Request Service' }
          paid_value.transition_type = 'in'

        } else if (account_invoices_doc.source_type.id == 5) {
          paid_value.operation = { ar: 'دفعة فاتورة حجز قاعة', en: 'Pay Book Hall' }
          paid_value.transition_type = 'in'

        } else if (account_invoices_doc.source_type.id == 8) {
          paid_value.operation = { ar: 'دفعة شحن رصيد عميل', en: 'Pay Recharge Customer Balance' }
          paid_value.transition_type = 'in'

          let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate
          let customerBalance = {
            id: account_invoices_doc.customer.id,
            paid_up: customerPay,
            sum: true
          }

          site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))

        }
        site.call('[amounts][safes][+]', Object.assign({}, paid_value))
      }

    })

    account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.net_value) - site.toNumber(account_invoices_doc.total_paid_up)
    account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.remain_amount)
    if (account_invoices_doc.source_type.id == 8) account_invoices_doc.remain_amount = 0

    if (account_invoices_doc.id) {
      $account_invoices.edit({
        where: {
          id: account_invoices_doc.id
        },
        set: account_invoices_doc,
        $req: req,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
          if (response.doc.remain_amount <= 0 && response.doc.source_type.id == 3)
            site.call('[account_invoices][order_invoice][paid]', Object.assign({}, response.doc.invoice_id))

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



  site.post("/api/account_invoices/posting", (req, res) => {
    let response = {}
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    response.done = false

    let account_invoices_doc = req.body

    account_invoices_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })
    account_invoices_doc.total_paid_up = 0

    if (account_invoices_doc.payment_list && account_invoices_doc.payment_list.length > 0)
      account_invoices_doc.payment_list.forEach(_payment_list => {
        if (_payment_list.currency)
          account_invoices_doc.total_paid_up += (_payment_list.paid_up * _payment_list.currency.ex_rate)

        let obj = {
          value: _payment_list.paid_up,
          safe: _payment_list.safe,
          date: _payment_list.date,
          company: account_invoices_doc.company,
          branch: account_invoices_doc.branch,
          code: account_invoices_doc.code,
          description: account_invoices_doc.description,
          payment_method: _payment_list.payment_method,
          currency: _payment_list.currency,
          shift: {
            id: account_invoices_doc.shift.id,
            code: account_invoices_doc.shift.code,
            name: account_invoices_doc.shift.name
          }
        }

        if (account_invoices_doc.posting) {

          _payment_list.posting = true

          if (account_invoices_doc.source_type.id == 1) {

            if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 4) {

              obj.operation = { ar: 'مرتجع فاتورة مشتريات', en: 'Return Purchase Invoice' }
              obj.value = (-Math.abs(obj.value))
            } else {

              obj.operation = { ar: 'فاتورة مشتريات', en: 'Purchase Invoice' }
            }

            obj.transition_type = 'out'

          } else if (account_invoices_doc.source_type.id == 2) {
            if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 6) {

              obj.value = (-Math.abs(obj.value))
              obj.operation = { ar: 'مرتجع فاتورة مبيعات', en: 'Return Sales Invoice' }
              if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {

                let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate
                let customerBalance = {
                  id: account_invoices_doc.customer.id,
                  paid_up: customerPay,
                  sum: true
                }
                site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
              }

            } else {

              obj.operation = { ar: 'فاتورة مبيعات', en: 'Sales Invoice' }
              if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {

                let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate
                let customerBalance = {
                  id: account_invoices_doc.customer.id,
                  paid_up: customerPay,
                  minus: true
                }
                site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
              }
            }

            obj.transition_type = 'in'

          } else if (account_invoices_doc.source_type.id == 3) {
            obj.operation = { ar: 'فاتورة شاشة الطلبات', en: 'Orders Screen Invoice' }
            obj.transition_type = 'in'

          } else if (account_invoices_doc.source_type.id == 4) {
            obj.operation = { ar: 'فاتورة طلب خدمة', en: 'Request Service Invoice' }
            obj.transition_type = 'in'
            site.call('[account_invoices][request_service][+]', Object.assign({}, account_invoices_doc.invoice_id))

          } else if (account_invoices_doc.source_type.id == 5) {
            obj.operation = { ar: 'فاتورة حجز قاعة', en: 'Book Hall Invoice' }
            obj.transition_type = 'in'
            site.call('[account_invoices][book_hall][+]', Object.assign({}, account_invoices_doc.invoice_id))

          } else if (account_invoices_doc.source_type.id == 8) {
            obj.operation = { ar: 'شحن رصيد عميل', en: 'Recharge Customer Balance' }
            obj.transition_type = 'in'
            let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate
            let customerBalance = {
              id: account_invoices_doc.customer.id,
              paid_up: customerPay,
              sum: true
            }
            site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
          }


        } else {
          _payment_list.posting = false

          if (account_invoices_doc.source_type.id == 1) {

            if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 4) {
              obj.operation = { ar: 'فك ترحيل مرتجع فاتورة مشتريات', en: 'Un Post Return Purchase Invoice' }

            } else {

              obj.value = (-Math.abs(obj.value))
              obj.operation = { ar: 'فك ترحيل فاتورة مشتريات', en: 'Un Post Purchase Invoice' }
            }

            obj.transition_type = 'out'

          } else if (account_invoices_doc.source_type.id == 2) {
            if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 6) {

              obj.operation = { ar: 'فك ترحيل مرتجع فاتورة مبيعات', en: 'Un Post Return Sales Invoice' }
              if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {
                let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate
                let customerBalance = {
                  id: account_invoices_doc.customer.id,
                  paid_up: customerPay,
                  minus: true
                }
                site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
              }

            } else {
              obj.value = (-Math.abs(obj.value))
              obj.operation = { ar: 'فك ترحيل فاتورة مبيعات', en: 'Un Post Sales Invoice' }
              if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {

                let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate
                let customerBalance = {
                  id: account_invoices_doc.customer.id,
                  paid_up: customerPay,
                  sum: true
                }
                site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
              }

            }

            obj.transition_type = 'in'

          } else if (account_invoices_doc.source_type.id == 3) {
            obj.transition_type = 'in'
            obj.value = (-Math.abs(obj.value))
            obj.operation = { ar: 'فك ترحيل فاتورة شاشة الطلبات', en: 'Un Post Orders Screen Invoice' }

          } else if (account_invoices_doc.source_type.id == 4) {
            obj.transition_type = 'in'
            obj.value = (-Math.abs(obj.value))
            obj.operation = { ar: 'فك ترحيل فاتورة طلب خدمة', en: 'Un Post Request Service Invoice' }

          } else if (account_invoices_doc.source_type.id == 5) {
            obj.operation = { ar: 'فك ترحيل فاتورة حجز قاعة', en: 'Un Post Book Hall Invoice' }
            obj.transition_type = 'in'
            obj.value = (-Math.abs(obj.value))

          } else if (account_invoices_doc.source_type.id == 8) {
            obj.operation = { ar: 'فك ترحيل شحن رصيد عميل', en: 'Un Post Recharge Customer Balance' }
            obj.transition_type = 'in'
            obj.value = (-Math.abs(obj.value))
            let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate
            let customerBalance = {
              id: account_invoices_doc.customer.id,
              paid_up: customerPay,
              minus: true
            }
            site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
          }
        }
        if (obj.safe) site.call('[amounts][safes][+]', Object.assign({}, obj))
      })

    account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.net_value) - site.toNumber(account_invoices_doc.total_paid_up)
    account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.remain_amount)
    if (account_invoices_doc.source_type.id == 8) account_invoices_doc.remain_amount = 0


    if (account_invoices_doc.source_type.id == 3) {

      let under_paid = {
        book_list: account_invoices_doc.current_book_list,
        net_value: account_invoices_doc.net_value,
        total_tax: account_invoices_doc.total_tax,
        total_discount: account_invoices_doc.total_discount,
        price_delivery_service: account_invoices_doc.price_delivery_service,
        service: account_invoices_doc.service,
        invoice_id: account_invoices_doc.invoice_id
      }

      if (!account_invoices_doc.posting)
        under_paid.return = true

      site.call('[account_invoices][order_invoice][+]', Object.assign({}, under_paid))
    }


    if (account_invoices_doc._id) {
      $account_invoices.edit({
        where: {
          _id: account_invoices_doc._id
        },
        set: account_invoices_doc,
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
      res.json(response)
    }
  })


  site.post("/api/account_invoices/delete", (req, res) => {
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
      $account_invoices.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc

          if (result.doc.posting) {
            result.doc.total_paid_up = 0
            result.doc.payment_list.forEach(_payment_list => {
              if (_payment_list.currency)
                result.doc.total_paid_up += (_payment_list.paid_up * _payment_list.currency.ex_rate)

              let obj = {
                value: _payment_list.paid_up,
                safe: _payment_list.safe,
                date: _payment_list.date,
                company: result.doc.company,
                branch: result.doc.branch,
                code: result.doc.code,
                description: result.doc.description,
                payment_method: _payment_list.payment_method,
                currency: _payment_list.currency,
                shift: {
                  id: result.doc.shift.id,
                  code: result.doc.shift.code,
                  name: result.doc.shift.name
                }
              }
              if (result.doc.source_type.id == 1) {


                if (result.doc.invoice_type && result.doc.invoice_type.id == 4) {

                  obj.operation = { ar: 'حذف مرتجع فاتورة مشتريات', en: 'Delete Return Purchase Invoice' }

                } else {
                  obj.value = (-Math.abs(obj.value))
                  obj.operation = { ar: 'حذف فاتورة مشتريات', en: 'Delete Purchase Invoice' }
                }

                obj.transition_type = 'out'


              } else if (result.doc.source_type.id == 2) {
                if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 6) {
                  obj.operation = { ar: 'حذف مرتجع فاتورة مبيعات', en: 'Delete Return Sales Invoice' }
                  if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {

                    let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate
                    let customerBalance = {
                      id: result.doc.customer.id,
                      paid_up: customerPay,
                      minus: true
                    }
                    site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
                  }

                } else {
                  obj.operation = { ar: 'حذف فاتورة مبيعات', en: 'Delete Sales Invoice' }
                  obj.value = (-Math.abs(obj.value))
                  if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {

                    let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate
                    let customerBalance = {
                      id: result.doc.customer.id,
                      paid_up: customerPay,
                      sum: true
                    }
                    site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
                  }
                }

                obj.transition_type = 'in'

              } else if (result.doc.source_type.id == 3) {

                obj.transition_type = 'in'
                obj.value = (-Math.abs(obj.value))
                obj.operation = { ar: 'حذف فاتورة شاشة الطلبات', en: 'Delete Orders Screen Invoice' }

              } else if (result.doc.source_type.id == 4) {

                obj.transition_type = 'in'
                obj.value = (-Math.abs(obj.value))
                obj.operation = { ar: 'حذف فاتورة طلب خدمة', en: 'Delete Request Service Invoice' }
              } else if (response.doc.source_type.id == 5) {

                obj.operation = { ar: 'حذف فاتورة حجز قاعة', en: 'Delete Book Hall Invoice' }
                obj.transition_type = 'in'
                obj.value = (-Math.abs(obj.value))

              } else if (response.doc.source_type.id == 8) {

                obj.operation = { ar: 'حذف شحن رصيد عميل', en: 'Recharge Customer Balance' }
                obj.transition_type = 'in'
                obj.value = (-Math.abs(obj.value))
                let customerPay = _payment_list.paid_up * _payment_list.currency.ex_rate
                let customerBalance = {
                  id: response.doc.customer.id,
                  paid_up: customerPay,
                  minus: true
                }
                site.quee('[customer][account_invoice][balance]', Object.assign({}, customerBalance))
              }


              if (obj.safe) site.call('[amounts][safes][+]', Object.assign({}, obj))

            })

            result.doc.remain_amount = site.toNumber(result.doc.net_value) - site.toNumber(result.doc.total_paid_up)
            result.doc.remain_amount = site.toNumber(result.doc.remain_amount)

            if (response.doc.source_type.id == 8) result.doc.remain_amount = 0


            if (result.doc.source_type.id == 3) {

              let under_paid = {
                book_list: result.doc.current_book_list,
                net_value: result.doc.net_value,
                total_tax: result.doc.total_tax,
                total_discount: result.doc.total_discount,
                price_delivery_service: result.doc.price_delivery_service,
                service: result.doc.service,
                invoice_id: result.doc.invoice_id
              }

              if (!account_invoices_doc.posting)
                under_paid.return = true

              site.call('[account_invoices][order_invoice][+]', Object.assign({}, under_paid))
            }
          }

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

  site.post("/api/account_invoices/update", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let account_invoices_doc = req.body

    account_invoices_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

    if (account_invoices_doc._id) {
      $account_invoices.edit({
        where: {
          _id: account_invoices_doc._id
        },
        set: account_invoices_doc,
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
      res.json(response)
    }
  })

  site.post("/api/account_invoices/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $account_invoices.findOne({
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




  site.post("/api/account_invoices/handel_invoice", (req, res) => {
    let response = {
      done: false
    }
    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id

    $account_invoices.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docs) => {
      if (!err) {
        response.done = true
        site.getDefaultSetting(req, callback => {

          let currency = {}
          if (callback.accounting && callback.accounting.currency)
            currency = callback.accounting.currency

          if (currency.id)
            docs.forEach(_doc => {
              if (_doc.payment_list && _doc.payment_list.length > 0) {

                _doc.payment_list.forEach(_payment => {
                  _payment.currency = currency
                  _payment.payment_method = _doc.payment_method
                  if (_doc.posting)
                    _payment.posting = true
                  else _payment.posting = false
                });

              } else {
                if (_doc.paid_up > 0)
                  _doc.payment_list = [{
                    date: _doc.date,
                    currency: currency,
                    safe: _doc.safe,
                    paid_up: _doc.paid_up,
                    payment_method: _doc.payment_method,
                    posting: _doc.posting ? true : false
                  }]
              }
              if (!_doc.total_paid_up) {
                _doc.net_value = site.toNumber(_doc.net_value)

                _doc.remain_amount = _doc.net_value
                _doc.payment_list = [];
              }

              $account_invoices.update(_doc)
            });



        })

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.post("/api/account_invoices/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}


    if (where['code'])
      where['code'] = new RegExp(where['code'], 'i')

    if (where['shift_code']) {
      where['shift.code'] = new RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }

    if (where['name'])
      where['name'] = new RegExp(where['name'], 'i')

    if (where['source_type']) {
      where['source_type.id'] = where['source_type'].id;
      delete where['source_type']
    }

    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method']
    }


    if (where['safe']) {
      where['safe.id'] = where['safe'].id;
      delete where['safe']
    }


    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to

    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

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
        response.list = docs
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })



  site.post("/api/account_invoices/un_post", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $account_invoices.findMany({
      select: req.body.select || {},
      where: { 'company.id': site.get_company(req).id },
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docs) => {
      if (!err) {
        docs.forEach(account_invoices_doc => {
          account_invoices_doc.posting = false;
          $account_invoices.update(account_invoices_doc);
        });
      }
      response.done = true
      res.json(response)
    })

  })


  site.getAccountInvoiceShift = function (shiftId, callback) {
    $account_invoices.findMany({
      where: { 'shift.id': shiftId },
      select: { id: 1, net_value: 1, total_tax: 1, total_discount: 1, payment_list: 1, source_type: 1, invoice_type: 1 }
    }, (err, docs) => {
      if (!err && docs) {
        let obj = {
          arr: [
            { id: 1, value: 0 },
            { id: 2, value: 0 },
            { id: 3, value: 0 },
            { id: 4, value: 0 }
          ],
          net_value: 0,
          total_discount: 0,
          total_tax: 0,
        }

        docs.forEach(_doc => {
          _doc.payment_list.forEach(_payment => {
            if (_payment.payment_method.id == 1) {
              obj.arr[0].value += _doc.paid_up
            } else if (_payment.payment_method.id == 2) {
              obj.arr[1].value += _doc.paid_up
            } else if (_payment.payment_method.id == 3) {
              obj.arr[2].value += _doc.paid_up
            } else if (_payment.payment_method.id == 4) {
              obj.arr[3].value += _doc.paid_up
            }
          });

          obj.net_value += _doc.net_value
          obj.total_discount += _doc.total_discount
          obj.total_tax += _doc.total_tax

        });

        callback(obj)
      } else callback(null)
    })
  }

}