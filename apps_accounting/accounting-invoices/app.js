module.exports = function init(site) {
  const $account_invoices = site.connectCollection("account_invoices")


  A_itemName_list = []
  site.on('[stores_items][item_name][change]', obj => {
    A_itemName_list.push(Object.assign({}, obj))
  })

  function A_itemName_handle(obj) {
    if (obj == null) {
      if (A_itemName_list.length > 0) {
        obj = A_itemName_list[0]
        A_itemName_handle(obj)
        A_itemName_list.splice(0, 1)
      } else {
        setTimeout(() => {
          A_itemName_handle(null)
        }, 1000);
      }
      return
    }

    let barcode = obj.sizes_list.map(_obj => _obj.barcode)
    let size = obj.sizes_list.map(_obj => _obj.size)

    $account_invoices.findMany({ 'company.id': obj.company.id, 'current_book_list.size': size, 'current_book_list.barcode': barcode }, (err, doc) => {
      if (doc) {

        doc.forEach(_doc => {
          if (_doc.current_book_list)
            _doc.current_book_list.forEach(_items => {
              obj.sizes_list.forEach(_size => {
                if (_items.barcode == _size.barcode)
                  _items.size = _size.size
              })
            });
          $account_invoices.update(_doc);
        });
        A_itemName_handle(null)
      }
    });
  }
  A_itemName_handle(null)



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
      account_invoices_doc.payment_list = [{
        date: account_invoices_doc.date,
        posting: true,
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
    };

    $account_invoices.add(account_invoices_doc, (err, doc) => {

      if (!err) {
        response.done = true;
        response.doc = doc;
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
            paid_value.operation = 'فاتورة مشتريات'
            paid_value.transition_type = 'out'
            site.call('[store_in][account_invoice][invoice]', doc.invoice_id)

          }

          else if (doc.source_type.id == 2) {
            paid_value.operation = 'فاتورة مبيعات'
            paid_value.transition_type = 'in'
            site.call('[store_out][account_invoice][invoice]', doc.invoice_id)
          }

          else if (doc.source_type.id == 3) {
            paid_value.operation = 'فاتورة شاشة الطلبات'
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
            site.call('[account_invoices][order_invoice][+]', under_paid)

          } else if (doc.source_type.id == 4) {
            paid_value.operation = 'فاتورة طلب خدمة'
            paid_value.transition_type = 'in'
            site.call('[account_invoices][request_service][+]', doc.invoice_id)

          } else if (doc.source_type.id == 5) {
            paid_value.operation = 'فاتورة حجز قاعة'
            paid_value.transition_type = 'in'
            site.call('[account_invoices][book_hall][+]', doc.invoice_id)
          }

          if (doc.safe) site.call('[amounts][safes][+]', paid_value)
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
          paid_value.operation = 'دفعة فاتورة مشتريات'
          paid_value.transition_type = 'out'
        }

        else if (account_invoices_doc.source_type.id == 2) {
          paid_value.operation = 'دفعة فاتورة مبيعات'
          paid_value.transition_type = 'in'
        }

        else if (account_invoices_doc.source_type.id == 3) {
          paid_value.operation = 'دفعة حساب طلبات'
          paid_value.transition_type = 'in'
        }

        else if (account_invoices_doc.source_type.id == 4) {
          paid_value.operation = 'دفعة طلب خدمة'
          paid_value.transition_type = 'in'
        }

        else if (account_invoices_doc.source_type.id == 5) {
          paid_value.operation = 'دفعة حجز قاعة'
          paid_value.transition_type = 'in'
        }
        site.call('[amounts][safes][+]', paid_value)
      }

    })

    account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.net_value) - site.toNumber(account_invoices_doc.total_paid_up)

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
            site.call('[account_invoices][order_invoice][paid]', response.doc.invoice_id)

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
    if (req.session.user === undefined)
      res.json(response)

    let response = {}
    response.done = false

    let account_invoices_doc = req.body

    account_invoices_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })
    account_invoices_doc.total_paid_up = 0

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
          console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwww");

          obj.operation = 'فاتورة مشتريات'
          obj.transition_type = 'out'
          site.call('[store_in][account_invoice][invoice]', account_invoices_doc.invoice_id)

        } else if (account_invoices_doc.source_type.id == 2) {
          console.log("ssssssssssssssssss");

          obj.operation = 'فاتورة مبيعات'
          obj.transition_type = 'in'
          site.call('[store_out][account_invoice][invoice]', account_invoices_doc.invoice_id)

        } else if (account_invoices_doc.source_type.id == 3) {
          obj.operation = ' فاتورة شاشة الطلبات'
          obj.transition_type = 'in'

        } else if (account_invoices_doc.source_type.id == 4) {
          obj.operation = 'فاتورة طلب خدمة'
          obj.transition_type = 'in'
          site.call('[account_invoices][request_service][+]', account_invoices_doc.invoice_id)

        } else if (account_invoices_doc.source_type.id == 5) {
          obj.operation = 'فاتورة حجز قاعة'
          obj.transition_type = 'in'
          site.call('[account_invoices][book_hall][+]', account_invoices_doc.invoice_id)
        }
      } else {
        _payment_list.posting = false

        if (account_invoices_doc.source_type.id == 1) {
          obj.transition_type = 'in'
          obj.operation = 'فك ترحيل فاتورة مشتريات'
        }
        else if (account_invoices_doc.source_type.id == 2) {
          obj.transition_type = 'out'
          obj.operation = 'فك ترحيل فاتورة مبيعات'
        }
        else if (account_invoices_doc.source_type.id == 3) {
          obj.transition_type = 'out'
          obj.operation = 'فك ترحيل فاتورة شاشة الطلبات'
        }
        else if (account_invoices_doc.source_type.id == 4) {
          obj.transition_type = 'out'
          obj.operation = 'فك ترحيل فاتورة طلب خدمة'
        }
        else if (_payment_list.source_type.id == 5) {
          obj.operation = 'فك ترحيل حجز قاعة'
          obj.transition_type = 'out'
        }

      }
      if (obj.safe) site.call('[amounts][safes][+]', obj)
    })

    account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.net_value) - site.toNumber(account_invoices_doc.total_paid_up)
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

      site.call('[account_invoices][order_invoice][+]', under_paid)
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
                obj.transition_type = 'in'
                obj.operation = 'حذف فاتورة مشتريات'
              }
              else if (result.doc.source_type.id == 2) {
                obj.transition_type = 'out'
                obj.operation = 'حذف فاتورة مبيعات'
              }
              else if (result.doc.source_type.id == 3) {
                obj.transition_type = 'out'
                obj.operation = 'حذف فاتورة شاشة الطلبات'

              }
              else if (result.doc.source_type.id == 4) {
                obj.transition_type = 'out'
                obj.operation = 'حذف فاتورة طلب خدمة'
              }
              else if (response.doc.source_type.id == 5) {
                obj.operation = 'حذف حجز قاعة'
                obj.transition_type = 'out'
              }
              if (obj.safe) site.call('[amounts][safes][+]', obj)

            })

            result.doc.remain_amount = site.toNumber(result.doc.net_value) - site.toNumber(result.doc.total_paid_up)

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

              site.call('[account_invoices][order_invoice][+]', under_paid)
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
    if (req.session.user === undefined) {
      res.json(response)
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

    where['payment_list.currency'] = null || undefined

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
              _doc.payment_list.forEach(_payment => {
                _payment.currency = currency
                _payment.payment_method = _doc.payment_method
                _payment.posting = true
              });
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

}