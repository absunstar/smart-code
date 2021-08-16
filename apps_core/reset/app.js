module.exports = function init(site) {
  const $reset = site.connectCollection("reset")
  const $stores_out = site.connectCollection("stores_out")
  const $stores_in = site.connectCollection("stores_in")
  const $account_invoices = site.connectCollection("account_invoices")



  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "reset",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })



  site.post("/api/stores_out/handel_invoices", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let whereStoreOut = {}

    whereStoreOut['company.id'] = site.get_company(req).id

    whereStoreOut['$or'] = [{ 'type.id': 3 }, { 'type.id': 4 }, { 'type.id': 6 }]

    $stores_out.findMany({
      select: req.body.select || {},
      where: whereStoreOut,
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docsStoreOut) => {
      if (!err) {

        let whereAccountInvoices = {}

        whereAccountInvoices['company.id'] = site.get_company(req).id
        whereAccountInvoices['source_type.id'] = 2

        $account_invoices.findMany({
          select: req.body.select || {},
          where: whereAccountInvoices,
          sort: req.body.sort || {
            id: -1
          },
        }, (err, docsAccountInvoices) => {
          if (!err) {

            if (docsAccountInvoices && docsAccountInvoices.length > 0) {
              if (docsStoreOut && docsStoreOut.length > 0) {

                docsAccountInvoices.forEach(_d_a_i => {
                  let foundAi = false

                  docsStoreOut.forEach(_d_s_out => {

                    if (_d_s_out.id === _d_a_i.invoice_id) {
                      foundAi = true
                      _d_a_i.total_discount = _d_s_out.total_discount
                      _d_a_i.total_tax = _d_s_out.total_tax
                      _d_a_i.items = _d_s_out.items
                      _d_a_i.net_value = _d_s_out.net_value
                      _d_a_i.total_value_added = _d_s_out.total_value_added

                      if (_d_a_i.items && _d_a_i.items.length > 0) {
                        _d_a_i.total_items_discount = 0
                        _d_a_i.items.forEach(_c_b_list => {

                          if (_c_b_list.discount.type == 'number')
                            _d_a_i.total_items_discount += ((_c_b_list.discount.value || 0) * _c_b_list.count);
                          else if (_c_b_list.discount.type == 'percent')
                            _d_a_i.total_items_discount += ((_c_b_list.discount.value || 0) * (_c_b_list.price * _c_b_list.count) / 100);

                        });
                        _d_a_i.total_items_discount = site.toNumber(_d_a_i.total_items_discount)

                      }

                      if (_d_s_out.currency && _d_s_out.currency.id) {
                        _d_a_i.currency = _d_s_out.currency

                      }

                      if (_d_s_out.payment_method && _d_s_out.payment_method.id) {
                        _d_a_i.payment_method = _d_s_out.payment_method

                      }

                      if (_d_s_out.safe && _d_s_out.safe.id) {
                        _d_a_i.safe = _d_s_out.safe

                      }

                      if (_d_s_out.paid_up) {
                        _d_a_i.paid_up = _d_s_out.paid_up

                      }

                      $account_invoices.update(_d_a_i);
                    }
                  });

                  if (!foundAi) {
                    $account_invoices.delete(_d_a_i);
                  }

                });
              }
            }

          }
        })

      }
      response.done = true
      res.json(response)
    })
  })





  site.post("/api/stores_in/handel_invoices", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let whereStoreOut = {}

    whereStoreOut['company.id'] = site.get_company(req).id

    whereStoreOut['$or'] = [{ 'type.id': 1 }, { 'type.id': 4 }]

    $stores_in.findMany({
      select: req.body.select || {},
      where: whereStoreOut,
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docsStoreIn) => {
      if (!err) {

        let whereAccountInvoices = {}

        whereAccountInvoices['company.id'] = site.get_company(req).id
        whereAccountInvoices['source_type.id'] = 1

        $account_invoices.findMany({
          select: req.body.select || {},
          where: whereAccountInvoices,
          sort: req.body.sort || {
            id: -1
          },
        }, (err, docsAccountInvoices) => {
          if (!err) {

            if (docsAccountInvoices && docsAccountInvoices.length > 0) {
              if (docsStoreIn && docsStoreIn.length > 0) {

                docsAccountInvoices.forEach(_d_a_i => {
                  let foundAi = false

                  docsStoreIn.forEach(_d_s_in => {

                    if (_d_s_in.id === _d_a_i.invoice_id) {
                      foundAi = true
                      _d_a_i.total_discount = _d_s_in.total_discount
                      _d_a_i.total_tax = _d_s_in.total_tax
                      _d_a_i.items = _d_s_in.items
                      _d_a_i.net_value = _d_s_in.net_value
                      _d_a_i.total_value_added = _d_s_in.total_value_added

                      if (_d_a_i.items && _d_a_i.items.length > 0) {
                        _d_a_i.total_items_discount = 0
                        _d_a_i.items.forEach(_c_b_list => {

                          if (_c_b_list.discount.type == 'number')
                            _d_a_i.total_items_discount += ((_c_b_list.discount.value || 0) * _c_b_list.count);
                          else if (_c_b_list.discount.type == 'percent')
                            _d_a_i.total_items_discount += ((_c_b_list.discount.value || 0) * (_c_b_list.cost * _c_b_list.count) / 100);

                        });
                        _d_a_i.total_items_discount = site.toNumber(_d_a_i.total_items_discount)

                      }

                      if (_d_s_in.currency && _d_s_in.currency.id) {
                        _d_a_i.currency = _d_s_in.currency

                      }

                      if (_d_s_in.payment_method && _d_s_in.payment_method.id) {
                        _d_a_i.payment_method = _d_s_in.payment_method

                      }

                      if (_d_s_in.safe && _d_s_in.safe.id) {
                        _d_a_i.safe = _d_s_in.safe

                      }

                      if (_d_s_in.paid_up) {
                        _d_a_i.paid_up = _d_s_in.paid_up

                      }

                      $account_invoices.update(_d_a_i);
                    }
                  });

                  if (!foundAi) {
                    $account_invoices.delete(_d_a_i);
                  }

                });
              }
            }

          }
        })

      }
      response.done = true
      res.json(response)
    })
  })




}