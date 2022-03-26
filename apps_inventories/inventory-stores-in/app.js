module.exports = function init(site) {

  const $stores_in = site.connectCollection("stores_in")

  // $stores_in.deleteDuplicate({ number: 1 }, (err, result) => {
  //   $stores_in.createUnique({ number: 1 }, (err, result) => {
  //   })
  // })


  site.post({
    name: '/api/stores_in/types/all',
    path: __dirname + '/site_files/json/types.json'
  })

  site.get({
    name: "stores_in",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })
  

  site.on('[stores_items][stores_in][openingBalance]', openingBalanceObj => {
    let stores_item_doc = { ...openingBalanceObj };

    site.getOpenShift({ companyId: stores_item_doc.company.id, branchCode: stores_item_doc.branch.code }, shiftCb => {
      if (shiftCb) {
        // site.getDefaultSetting(openingBalanceObj.req, settingCb => {

        // site.isAllowedDate(openingBalanceObj.req, allowDate => {
        //   if (!allowDate) {

        //     response.error = 'Don`t Open Period'
        //     res.json(response)
        //   } else {

        let opBalanceList = []

        stores_item_doc.sizes.forEach(_size => {
          _size.opening_palnce_list = _size.opening_palnce_list || []
          _size.opening_palnce_list.forEach(_opBalance => {
            let found = opBalanceList.some(_ar => _ar.store.id === _opBalance.store.id);

            let cb = site.getNumbering({ company: stores_item_doc.company, date: new Date(), screen: 'opening_balances_Store' });

            let unit = _size.size_units_list.find(_unit => { return _unit.id === _opBalance.unit.id });

            let discount = 0;

            if (_opBalance.count) {
              if (unit.discount.type == 'number')
                discount = (unit.discount.value || 0) * _opBalance.count;
              else if (unit.discount.type == 'percent')
                discount = (unit.discount.value || 0) * (unit.cost * _opBalance.count) / 100;

            }


            let item = {
              name_ar: stores_item_doc.name_ar,
              name_en: stores_item_doc.name_en,
              size_ar: _size.size_ar,
              size_en: _size.size_en,
              value_added: 0,
              total_v_a: 0,
              item_group: stores_item_doc.item_group,
              validit: 0,
              size_units_list: _size.size_units_list,
              unit: unit,
              cost: unit.cost,
              price: unit.price,
              average_cost: unit.average_cost,
              barcode: _size.barcode,
              count: _opBalance.count,
              discount: unit.discount,
              total: (unit.cost * _opBalance.count) - discount,
              current_count: 0
            }


            let opBalanceObj = {
              image_url: "/images/store_in.png",
              store: _opBalance.store,
              company: stores_item_doc.company,
              add_user_info: stores_item_doc.add_user_info,
              branch: stores_item_doc.branch,
              shift: shiftCb,
              invoice: false,
              type: {
                id: 3,
                en: 'Opening Balance Store',
                ar: 'رصيد إفتتاحي مخزني'
              },
              items: [item],
              vendor: _opBalance.vendor,
              discountes: [],
              taxes: [],
              date: new Date(),
              supply_date: new Date(),
              posting: true,
              total_tax: 0,
              total_discount: 0,
              total_value: item.total,
              net_value: item.total,
              code: cb.code
            }


            if (!found) {
              opBalanceList.push(opBalanceObj)

            } else {
              opBalanceList.forEach(_arr => {
                if (_arr.store && _arr.store && _arr.store.id == _opBalance.store.id) {
                  _arr.items.push(item);
                  _arr.total_value = _arr.total_value + item.total;
                  _arr.net_value = _arr.net_value + item.total;
                }
              });
            }

          });
        });
        opBalanceList.forEach(_opBa => {

          _opBa.items.forEach(_itm => {
            _itm.current_count = site.toNumber(_itm.current_count)
            _itm.count = site.toNumber(_itm.count)
            _itm.cost = site.toNumber(_itm.cost)
            _itm.price = site.toNumber(_itm.price)
            _itm.total = site.toNumber(_itm.total)
            if (_itm.patch_list && _itm.patch_list.length > 0) {
              let filter_patch = _itm.patch_list.filter(_p => _p.count !== 0)
              _itm.patch_list = filter_patch
            }
          })


          _opBa.return_paid = {
            items: _opBa.items,
            total_discount: _opBa.total_discount,
            total_value_added: _opBa.total_value_added,
            total_tax: _opBa.total_tax,
            total_value: _opBa.total_value,
            net_value: _opBa.net_value,
          }

          $stores_in.add(_opBa, (err, doc) => {

            if (!err) {


              if (doc.posting) {

                doc.items.forEach((_itm, i) => {

                  _itm.store = doc.store
                  _itm.company = doc.company
                  _itm.branch = doc.branch
                  _itm.source_type = doc.type
                  _itm.store_in = true
                  _itm.code = doc.code
                  _itm.vendor = doc.vendor
                  _itm.date = doc.date
                  _itm.current_status = 'storein'
                  _itm.shift = {
                    id: doc.shift.id,
                    code: doc.shift.code,
                    name_ar: doc.shift.name_ar, name_en: doc.shift.name_en
                  }

                  if (doc.type.id == 1) _itm.set_average = 'sum_average'

                  _itm.type = 'sum'
                  _itm.transaction_type = 'in'
                  site.quee('item_transaction + items', { ..._itm })


                  _itm.count = Math.abs(_itm.count)

                  site.quee('[transfer_branch][stores_items][add_balance]', { ..._itm })
                })

              }

            }
          })

        });
        // })
      }
    })
    // } else {
    //   response.error = 'Don`t Found Open Shift'
    //   res.json(response)
    // }

    // })

  });

  site.on('[stores_items][item_name][change]', objectStoreIn => {

    let barcode = objectStoreIn.sizes_list.map(_obj => _obj.barcode)

    $stores_in.findMany({ 'company.id': objectStoreIn.company.id, 'items.barcode': barcode }, (err, doc) => {
      doc.forEach(_doc => {
        if (_doc.items) _doc.items.forEach(_items => {
          if (objectStoreIn.sizes_list) objectStoreIn.sizes_list.forEach(_size => {
            if (_items.barcode == _size.barcode) {
              _items.size_ar = _size.size_ar
              _items.size_en = _size.size_en
              _items.name_ar = _size.name_ar
              _items.name_en = _size.name_en
            }
          })
        });
        $stores_in.update(_doc);
      });
    });
  });

  site.on('[store_in][account_invoice][invoice]', (storeInID, action, next) => {
    $stores_in.findOne({ id: storeInID }, (err, doc) => {
      if (doc) {
        if (action == 'add') doc.invoice = true
        else if (action == 'delete') doc.invoice = false
        $stores_in.update(doc, () => {
          next()
        });
      } else {
        next()
      }
    });
  });

  

  site.post("/api/stores_in/add", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let stores_in_doc = req.body
    stores_in_doc.company = site.get_company(req)
    stores_in_doc.branch = site.get_branch(req)

    site.getOpenShift({ companyId: stores_in_doc.company.id, branchCode: stores_in_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {

            stores_in_doc.add_user_info = site.security.getUserFinger({ $req: req, $res: res })

            stores_in_doc.$req = req
            stores_in_doc.$res = res

            stores_in_doc.date = site.toDateTime(stores_in_doc.date)

            stores_in_doc.items.forEach(_itm => {
              _itm.current_count = site.toNumber(_itm.current_count)
              _itm.count = site.toNumber(_itm.count)
              _itm.cost = site.toNumber(_itm.cost)
              _itm.price = site.toNumber(_itm.price)
              _itm.total = site.toNumber(_itm.total)
              if (_itm.patch_list && _itm.patch_list.length > 0) {
                let filter_patch = _itm.patch_list.filter(_p => _p.count !== 0)
                _itm.patch_list = filter_patch
              }
            })

            stores_in_doc.total_value = site.toNumber(stores_in_doc.total_value)
            stores_in_doc.net_value = site.toNumber(stores_in_doc.net_value)

            if (stores_in_doc.type.id == 1) {

              stores_in_doc.return_paid = {
                items: stores_in_doc.items,
                total_discount: stores_in_doc.total_discount,
                total_value_added: stores_in_doc.total_value_added,
                total_tax: stores_in_doc.total_tax,
                total_value: stores_in_doc.total_value,
                net_value: stores_in_doc.net_value,
              }
            }

            site.isAllowOverDraft(req, req.body.items, cbOverDraft => {

              if (!cbOverDraft.overdraft && cbOverDraft.value && stores_in_doc.posting && stores_in_doc.type.id == 4) {

                response.error = 'OverDraft Not Active'
                res.json(response)

              } else {

                let num_obj = {
                  company: site.get_company(req),
                  date: new Date(stores_in_doc.date)
                };

                if (stores_in_doc.type.id == 1) num_obj.screen = 'purchases_invoices_store';
                else if (stores_in_doc.type.id == 2) num_obj.screen = 'depts_store';
                else if (stores_in_doc.type.id == 3) num_obj.screen = 'opening_balances_Store';
                else if (stores_in_doc.type.id == 4) num_obj.screen = 'return_purchases_store';
                let cb = site.getNumbering(num_obj);
                if (!stores_in_doc.code && !cb.auto) {

                  response.error = 'Must Enter Code';
                  res.json(response);
                  return;

                } else if (cb.auto) {
                  stores_in_doc.code = cb.code;
                }

                $stores_in.add(stores_in_doc, (err, doc) => {

                  if (!err) {

                    response.done = true
                    response.doc = doc

                    if (doc.posting) {

                      doc.items.forEach((_itm, i) => {

                        _itm.store = doc.store
                        _itm.company = doc.company
                        _itm.branch = doc.branch
                        _itm.source_type = doc.type
                        _itm.store_in = true
                        _itm.code = doc.code
                        _itm.vendor = doc.vendor
                        _itm.date = doc.date
                        _itm.current_status = 'storein'
                        _itm.shift = {
                          id: doc.shift.id,
                          code: doc.shift.code,
                          name_ar: doc.shift.name_ar, name_en: doc.shift.name_en
                        }

                        if (doc.type.id == 4) {
                          _itm.set_average = 'minus_average'
                          _itm.type = 'minus'
                          _itm.count = (-Math.abs(_itm.count))
                          _itm.transaction_type = 'in'
                          site.returnStoresIn(doc, res => { })
                          site.quee('item_transaction + items', { ..._itm })
                        } else {
                          if (doc.type.id == 1) _itm.set_average = 'sum_average'

                          _itm.type = 'sum'
                          _itm.transaction_type = 'in'
                          site.quee('item_transaction + items', { ..._itm })
                        }

                        _itm.count = Math.abs(_itm.count)

                        site.quee('[transfer_branch][stores_items][add_balance]', { ..._itm })
                      })

                    }

                  } else {
                    response.error = err.message
                  }
                  res.json(response)
                })
              }
            })
          }
        })
      } else {
        response.error = 'Don`t Found Open Shift'
        res.json(response)
      }

    })
  })


  site.post("/api/stores_in/update", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let stores_in_doc = req.body
    site.getOpenShift({ companyId: stores_in_doc.company.id, branchCode: stores_in_doc.branch.code }, shiftCb => {
      if (shiftCb) {

        site.isAllowedDate(req, allowDate => {
          if (!allowDate) {

            response.error = 'Don`t Open Period'
            res.json(response)
          } else {


            stores_in_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

            stores_in_doc.vendor = site.fromJson(stores_in_doc.vendor)
            stores_in_doc.type = site.fromJson(stores_in_doc.type)
            stores_in_doc.date = new Date(stores_in_doc.date)

            stores_in_doc.items.forEach(_itm => {
              _itm.count = site.toNumber(_itm.count)
              _itm.cost = site.toNumber(_itm.cost)
              _itm.price = site.toNumber(_itm.price)
              _itm.total = site.toNumber(_itm.total)
              if (_itm.patch_list && _itm.patch_list.length > 0) {
                let filter_patch = _itm.patch_list.filter(_p => _p.count !== 0)
                _itm.patch_list = filter_patch
              }
            })

            stores_in_doc.total_value = site.toNumber(stores_in_doc.total_value)

            if (stores_in_doc.type.id == 1)
              stores_in_doc.return_paid = {
                items: stores_in_doc.items,
                total_discount: stores_in_doc.total_discount,
                total_value_added: stores_in_doc.total_value_added,
                total_tax: stores_in_doc.total_tax,
                total_value: stores_in_doc.total_value,
                net_value: stores_in_doc.net_value,
              }

            if (stores_in_doc._id) {
              $stores_in.edit({
                where: {
                  _id: stores_in_doc._id
                },
                set: stores_in_doc,
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
          }
        })
      } else {
        response.error = 'Don`t Found Open Shift'
        res.json(response)
      }
    })
  })


  site.post("/api/stores_in/posting", (req, res) => {
    let response = {}
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    response.done = false

    let stores_in_doc = req.body
    site.getDefaultSetting(req, settingCallback => {

      if (stores_in_doc.invoice && !stores_in_doc.posting && settingCallback.accounting && !settingCallback.accounting.link_warehouse_account_invoices) {
        response.error = 'It`s Have Account Invoice'
        res.json(response)

      } else {

        site.getOpenShift({ companyId: stores_in_doc.company.id, branchCode: stores_in_doc.branch.code }, shiftCb => {
          if (shiftCb) {

            site.isAllowedDate(req, allowDate => {
              if (!allowDate) {

                response.error = 'Don`t Open Period'
                res.json(response)
              } else {


                stores_in_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res })

                if (stores_in_doc.type.id == 1) {

                  stores_in_doc.return_paid = {
                    items: stores_in_doc.items,
                    total_discount: stores_in_doc.total_discount,
                    total_value_added: stores_in_doc.total_value_added,
                    total_tax: stores_in_doc.total_tax,
                    total_value: stores_in_doc.total_value,
                    net_value: stores_in_doc.net_value,
                  }
                }

                site.isAllowOverDraft(req, req.body.items, cbOverDraft => {

                  if (!cbOverDraft.overdraft && cbOverDraft.value && stores_in_doc.posting && stores_in_doc.type.id == 4) {

                    response.error = 'OverDraft Not Active'
                    res.json(response)

                  } else if (!cbOverDraft.overdraft && cbOverDraft.value && !stores_in_doc.posting && stores_in_doc.type.id != 4) {

                    response.error = 'OverDraft Not Active'
                    res.json(response)

                  } else {

                    if (stores_in_doc._id) {
                      $stores_in.edit({
                        where: {
                          _id: stores_in_doc._id
                        },
                        set: stores_in_doc,
                        $req: req,
                        $res: res
                      }, (err, result) => {
                        if (!err) {
                          response.done = true
                          response.doc = result.doc
                          if (result.doc.items && result.doc.items.length > 0) {

                            result.doc.items.forEach((_itm, i) => {
                              _itm.store = result.doc.store
                              _itm.company = result.doc.company
                              _itm.branch = result.doc.branch
                              _itm.source_type = result.doc.type
                              _itm.store_in = true
                              _itm.code = result.doc.code
                              _itm.vendor = result.doc.vendor
                              _itm.date = result.doc.date
                              _itm.shift = {
                                id: result.doc.shift.id,
                                code: result.doc.shift.code,
                                name_ar: result.doc.shift.name_ar, name_en: result.doc.shift.name_en
                              }



                              if (result.doc.posting) {
                                _itm.current_status = 'storein'

                                if (result.doc.type.id == 4) {
                                  _itm.set_average = 'minus_average'
                                  _itm.type = 'minus'
                                  _itm.count = (-Math.abs(_itm.count))
                                  _itm.transaction_type = 'in'
                                  site.quee('item_transaction + items', { ..._itm })
                                } else {
                                  if (result.doc.type.id == 1)
                                    _itm.set_average = 'sum_average'
                                  _itm.type = 'sum'
                                  _itm.transaction_type = 'in'
                                  site.quee('item_transaction + items', { ..._itm })
                                }



                              } else {
                                _itm.current_status = 'r_storein'
                                if (result.doc.type.id == 4) {
                                  _itm.set_average = 'sum_average'
                                  _itm.type = 'sum'
                                  _itm.transaction_type = 'in'
                                  site.quee('item_transaction + items', { ..._itm })
                                } else {
                                  if (result.doc.type.id == 1)
                                    _itm.set_average = 'minus_average'
                                  _itm.type = 'minus'
                                  _itm.count = (-Math.abs(_itm.count))
                                  _itm.transaction_type = 'in'
                                  site.quee('item_transaction + items', { ..._itm })
                                }
                              }
                              _itm.count = Math.abs(_itm.count) // amr

                              site.quee('[transfer_branch][stores_items][add_balance]', { ..._itm })

                            })
                          }

                          if (result.doc.type && result.doc.type.id == 4) {
                            if (!result.doc.posting)
                              result.doc.return = true
                            site.returnStoresIn(result.doc, res => { })
                          }

                        } else {
                          response.error = err.message
                        }
                        res.json(response)
                      })
                    } else {
                      res.json(response)
                    }
                  }
                })

              }
            })
          } else {
            response.error = 'Don`t Found Open Shift'
            res.json(response)
          }
        })
      }
    })

  })

  site.post("/api/stores_in/delete", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let stores_in_doc = req.body

    site.getDefaultSetting(req, settingCallback => {

      if (stores_in_doc.invoice && settingCallback.accounting && !settingCallback.accounting.link_warehouse_account_invoices) {
        response.error = 'It`s Have Account Invoice'
        res.json(response)
      } else {

        site.getOpenShift({ companyId: stores_in_doc.company.id, branchCode: stores_in_doc.branch.code }, shiftCb => {
          if (shiftCb) {

            site.isAllowedDate(req, allowDate => {
              if (!allowDate) {

                response.error = 'Don`t Open Period'
                res.json(response)
              } else {

                site.isAllowOverDraft(req, req.body.items, cbOverDraft => {

                  if (!cbOverDraft.overdraft && cbOverDraft.value && stores_in_doc.posting && stores_in_doc.type.id != 4) {

                    response.error = 'OverDraft Not Active'
                    res.json(response)

                  } else {

                    if (stores_in_doc._id) {
                      $stores_in.delete({
                        where: {
                          _id: stores_in_doc._id
                        },
                        $req: req,
                        $res: res
                      }, (err, result) => {
                        if (!err) {
                          response.done = true
                          if (stores_in_doc.posting) {

                            stores_in_doc.items.forEach((_itm, i) => {
                              _itm.store = stores_in_doc.store
                              _itm.company = stores_in_doc.company
                              _itm.branch = stores_in_doc.branch
                              _itm.source_type = stores_in_doc.type
                              _itm.store_in = true
                              _itm.code = stores_in_doc.code
                              _itm.vendor = stores_in_doc.vendor
                              _itm.date = stores_in_doc.date
                              _itm.current_status = 'd_storein'
                              _itm.shift = {
                                id: stores_in_doc.shift.id,
                                code: stores_in_doc.shift.code,
                                name_ar: stores_in_doc.shift.name_ar,
                                name_en: stores_in_doc.shift.name_en
                              }
                              if (result.doc.type.id == 4) {
                                _itm.set_average = 'sum_average'
                                _itm.type = 'sum'
                                _itm.transaction_type = 'in'
                                site.quee('item_transaction + items', { ..._itm })
                              } else {
                                if (result.doc.type.id == 1)
                                  _itm.set_average = 'minus_average'
                                _itm.type = 'minus'
                                _itm.count = (-Math.abs(_itm.count))
                                _itm.transaction_type = 'in'
                                site.quee('item_transaction + items', { ..._itm })
                              }
                              _itm.count = Math.abs(_itm.count)
                              site.quee('[transfer_branch][stores_items][add_balance]', { ..._itm })

                            });

                            if (stores_in_doc.type && stores_in_doc.type.id == 4) {
                              result.doc.return = true
                              site.returnStoresIn(stores_in_doc, res => { })

                            }

                          }
                        }
                        res.json(response)
                      })
                    } else res.json(response)

                  }

                })
              }

            })
          } else {
            response.error = 'Don`t Found Open Shift'
            res.json(response)
          }
        })
      }
    })

  })

  site.post("/api/stores_in/view", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    $stores_in.findOne({
      where: {
        _id: site.mongodb.ObjectID(req.body._id)
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

  site.post("/api/stores_in/all", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.body.where || {}
    let limit = where.limit || undefined

    let search = req.body.search

    if (search) {
      where.$or = []

      where.$or.push({
        'vendor.name': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'vendor.mobile': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'vendor.phone': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'vendor.national_id': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'vendor.email': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'store.name': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'code': search
      })

      where.$or.push({
        'store.payment_method.ar': site.get_RegExp(search, "i")
      })

      where.$or.push({
        'store.payment_method.en': site.get_RegExp(search, "i")
      })

    }

    where['company.id'] = site.get_company(req).id

    if (where['branchAll']) {
      delete where['branchAll']
    } else {
      where['branch.code'] = site.get_branch(req).code
    }


    if (where && where['notes']) {
      where['notes'] = site.get_RegExp(where['notes'], 'i')
    }

    if (where && where['code']) {
      where['code'] = where['code']
    }

    if (where && where['supply_number']) {
      where['supply_number'] = site.get_RegExp(where['supply_number'], 'i')
    }

    if (where && where['limit']) {
      delete where['limit']
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

    if (where['name']) {
      where['items.name'] = site.get_RegExp(where['name'], 'i')
      delete where['name']
    }

    if (where['size_ar']) {
      where['items.size_ar'] = site.get_RegExp(where['size_ar'], 'i')
      delete where['size_ar']
    }

    if (where['size_en']) {
      where['items.size_en'] = site.get_RegExp(where['size_en'], 'i')
      delete where['size_en']
    }

    if (where['barcode']) {
      where['items.barcode'] = where['barcode']
      delete where['barcode']
    }


    if (where['shift_code']) {
      where['shift.code'] = where['shift_code']
      delete where['shift_code']
    }

    if (where['employee']) {
      where['employee.id'] = where['employee'].id;
      delete where['employee']
    }

    if (where['type']) {
      where['type.id'] = where['type'].id;
      delete where['type']
    }

    if (where['source']) {
      where['source.id'] = where['source'].id;
      delete where['source']
    }

    if (where['total_discount']) {
      where['total_discount'] = where['total_discount'];
    }

    if (where['total_value']) {
      where['total_value'] = where['total_value'];
    }

    if (where['total_tax']) {
      where['total_tax'] = where['total_tax'];
    }

    if (where['nat_value']) {
      where['nat_value'] = where['nat_value'];
    }

    if (where['paid_up']) {
      where['paid_up'] = where['paid_up'];
    }

    if (where['post']) {
      where['posting'] = true
      delete where['post']

    }
    if (where['un_post']) {
      where['$or'] = [{ 'posting': false }, { 'posting': undefined }]
      delete where['un_post']
    }

    if (where['vendor']) {
      where['vendor.id'] = where['vendor'].id;
      delete where['vendor']
    }

    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method']
    }

    if (where['safe']) {
      where['safe.id'] = where['safe'].id;
      delete where['safe']
    }

    if (where['value']) {
      where['value'] = where['value'];
    }


    if (where['description']) {
      where['description'] = site.get_RegExp(where['description'], 'i')
    }

    delete where.search
    $stores_in.findMany({
      select: req.body.select || {},
      limit: limit,
      where: where,
      sort: { id: -1 }
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.list = docs
        response.count = docs.length

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.post("/api/stores_in/handel_store_in", (req, res) => {
    let response = {
      done: false
    }
    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id

    $stores_in.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docs) => {
      if (!err) {
        response.done = true
        site.getDefaultSetting(req, callback => {

          let unit = {}
          if (callback.inventory.unit)
            unit = callback.inventory.unit

          if (unit.id) {

            docs.forEach(_doc => {

              _doc.items.forEach(_item => {
                if (_item.unit == null || undefined)
                  _item.unit = {
                    id: unit.id,
                    name_ar: unit.name_ar,
                    name_en: unit.name_en,
                    convert: 1
                  }
              });

              if (_doc.type.id == 1)
                _doc.return_paid = {
                  items: _doc.items,
                  total_discount: _doc.total_discount,
                  total_value_added: _doc.total_value_added,
                  total_tax: _doc.total_tax,
                  total_value: _doc.total_value,
                  net_value: _doc.net_value,
                }

              $stores_in.update(_doc)
            });
          }
        })

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.returnStoresIn = function (obj, res) {
    $stores_in.findOne({ id: obj.retured_id }, (err, doc) => {
      if (doc && doc.return_paid) {
        obj.items.forEach(_itemsObj => {
          doc.return_paid.items.forEach(_itemsDoc => {
            if (_itemsObj.barcode === _itemsDoc.barcode && _itemsObj.size_ar == _itemsDoc.size_ar) {
              if (_itemsObj.patch_list && _itemsObj.patch_list.length > 0 && _itemsDoc.patch_list && _itemsDoc.patch_list.length > 0) {
                let foundPatshList = []

                _itemsObj.patch_list.forEach(objPatch => {
                  let foundPatsh = _itemsDoc.patch_list.some(_p1 => objPatch.patch === _p1.patch)

                  if (!foundPatsh) foundPatshList.push(objPatch)

                  _itemsDoc.patch_list.forEach(docPatch => {
                    if (objPatch.patch === docPatch.patch) {
                      if (obj.return) {
                        docPatch.count = docPatch.count + objPatch.count

                      } else {
                        docPatch.count = docPatch.count - objPatch.count
                      }
                    }

                  });
                });
                if (obj.return) {
                  foundPatshList.forEach(fP => {
                    _itemsDoc.patch_list.push(fP)
                  });
                } else {
                  let filter_patch = _itemsDoc.patch_list.filter(_p => _p.count !== 0)
                  _itemsDoc.patch_list = filter_patch

                  if (_itemsDoc.patch_list.length === 1 && _itemsDoc.patch_list[0].count === 0)
                    _itemsDoc.patch_list = []

                }
              }


              if (obj.return) _itemsDoc.count = _itemsDoc.count + _itemsObj.count
              else _itemsDoc.count = _itemsDoc.count - _itemsObj.count

              let discount = 0;
              if (_itemsDoc.discount) {
                if (_itemsDoc.discount.type == 'number')
                  discount = _itemsDoc.discount.value * _itemsDoc.count;
                else if (_itemsDoc.discount.type == 'percent')
                  discount = _itemsDoc.discount.value * (_itemsDoc.price * _itemsDoc.count) / 100;
              }

              _itemsDoc.total = (_itemsDoc.count * _itemsDoc.price) - discount;

            }
          });


        });
        if (obj.return) {
          doc.return_paid.total_discount = doc.return_paid.total_discount + obj.total_discount
          doc.return_paid.total_value_added = doc.return_paid.total_value_added + obj.total_value_added
          doc.return_paid.total_tax = doc.return_paid.total_tax + obj.total_tax
          doc.return_paid.total_value = doc.return_paid.total_value + obj.total_value
          doc.return_paid.net_value = doc.return_paid.net_value + obj.net_value
        } else {
          doc.return_paid.total_discount = doc.return_paid.total_discount - obj.total_discount
          doc.return_paid.total_value_added = doc.return_paid.total_value_added - obj.total_value_added
          doc.return_paid.total_tax = doc.return_paid.total_tax - obj.total_tax
          doc.return_paid.total_value = doc.return_paid.total_value - obj.total_value
          doc.return_paid.net_value = doc.return_paid.net_value - obj.net_value
        }
        doc.return_paid.total_discount = site.toNumber(doc.return_paid.total_discount)
        doc.return_paid.total_value_added = site.toNumber(doc.return_paid.total_value_added)
        doc.return_paid.total_tax = site.toNumber(doc.return_paid.total_tax)
        doc.return_paid.total_value = site.toNumber(doc.return_paid.total_value)
        doc.return_paid.net_value = site.toNumber(doc.return_paid.net_value)

        $stores_in.update(doc);
      }

    });
  };


  site.post("/api/stores_in/un_post", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $stores_in.findMany({
      select: req.body.select || {},
      where: { 'company.id': site.get_company(req).id },
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docs) => {
      if (!err) {
        docs.forEach(stores_in_doc => {
          stores_in_doc.posting = false;
          stores_in_doc.return_paid = null;
          $stores_in.update(stores_in_doc);
        });
      }
      response.done = true
      res.json(response)
    })
  })


  site.post("/api/stores_in/handel_zeft", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      res.json(response)
      return;
    }


    $stores_in.findMany({
      select: req.body.select || {},
      where: { 'company.id': site.get_company(req).id },
      sort: req.body.sort || {
        id: -1
      },
    }, (err, docs) => {
      if (!err) {
        docs.forEach(stores_in_doc => {

          stores_in_doc.$req = req
          stores_in_doc.$res = res

          stores_in_doc.items.forEach(itm => {
            itm.current_count = site.toNumber(itm.current_count)
            itm.count = site.toNumber(itm.count)
            itm.cost = site.toNumber(itm.cost)
            itm.price = site.toNumber(itm.price)
            itm.total = site.toNumber(itm.total)
          })

          stores_in_doc.items.map(_item => _item.unit.id = 1)

          stores_in_doc.total_value = site.toNumber(stores_in_doc.total_value)
          stores_in_doc.net_value = site.toNumber(stores_in_doc.net_value)

          if (stores_in_doc.type.id == 1) {
            stores_in_doc.return_paid = {
              items: stores_in_doc.items,
              total_discount: stores_in_doc.total_discount,
              total_value_added: stores_in_doc.total_value_added,
              total_tax: stores_in_doc.total_tax,
              total_value: stores_in_doc.total_value,
              net_value: stores_in_doc.net_value,
            }
          }

          $stores_in.edit(stores_in_doc, (err, doc) => {

            if (!err) {

              response.done = true
              response.doc = doc

              if (doc.posting) {

                doc.items.forEach((_itm, i) => {
                  _itm.store = doc.store
                  _itm.company = doc.company
                  _itm.branch = doc.branch
                  _itm.source_type = doc.type
                  _itm.store_in = true
                  _itm.code = doc.code
                  _itm.vendor = doc.vendor
                  _itm.date = doc.date
                  _itm.current_status = 'storein'
                  _itm.shift = {
                    id: doc.shift.id,
                    code: doc.shift.code,
                    name_ar: doc.shift.name_ar, name_en: doc.shift.name_en
                  }

                  if (doc.type.id == 4) {
                    _itm.set_average = 'minus_average'
                    _itm.type = 'minus'
                    _itm.transaction_type = 'out'
                    site.returnStoresIn(doc, res => { })
                    site.quee('item_transaction - items', { ..._itm })
                  } else {
                    if (doc.type.id == 1)
                      _itm.set_average = 'sum_average'

                    _itm.type = 'sum'
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', { ..._itm })
                  }
                  site.quee('[transfer_branch][stores_items][add_balance]', { ..._itm })
                })

              }

            } else {
              response.error = err.message
            }
            res.json(response)
          })
        });
      }
    })
  })



  site.post("/api/stores_in/post_all", (req, res) => {
    let response = {}
    response.done = false
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $stores_in.findMany({
      select: req.body.select || {},
      where: { 'company.id': site.get_company(req).id },
    }, (err, docs) => {

      if (!err) {

        docs.forEach(stores_in_doc => {
          stores_in_doc.posting = true

          if (stores_in_doc._id) {
            $stores_in.edit({
              where: {
                _id: stores_in_doc._id
              },
              set: stores_in_doc,
              $req: req,
              $res: res
            }, (err, result) => {
              if (!err) {
                response.done = true
                response.doc = result.doc

                result.doc.items.forEach((_itm, i) => {
                  _itm.store = result.doc.store
                  _itm.company = result.doc.company
                  _itm.branch = result.doc.branch
                  _itm.source_type = result.doc.type
                  _itm.store_in = true
                  _itm.code = result.doc.code
                  _itm.vendor = result.doc.vendor
                  _itm.date = result.doc.date
                  _itm.shift = {
                    id: result.doc.shift.id,
                    code: result.doc.shift.code,
                    name_ar: result.doc.shift.name_ar, name_en: result.doc.shift.name_en
                  }

                  _itm.current_status = 'storein'

                  if (result.doc.type.id == 4) {
                    _itm.set_average = 'minus_average'
                    _itm.type = 'minus'
                    _itm.count = (-Math.abs(_itm.count))
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', { ..._itm })
                  } else {
                    if (result.doc.type.id == 1)
                      _itm.set_average = 'sum_average'
                    _itm.type = 'sum'
                    _itm.transaction_type = 'in'
                    site.quee('item_transaction + items', { ..._itm })
                  }

                  _itm.count = Math.abs(_itm.count) // amr

                  site.quee('[transfer_branch][stores_items][add_balance]', { ..._itm })

                })

                if (result.doc.type && result.doc.type.id == 4) {
                  if (!result.doc.posting)
                    result.doc.return = true
                  site.returnStoresIn(result.doc, res => { })
                }

              } else {
                response.error = err.message
              }
              res.json(response)
            })
          } else {
            res.json(response)
          }

        });

      }
      response.done = true
      res.json(response)
    })
  })


  site.getStoresIn = function (whereObj, callback) {
    callback = callback || {};
    let where = whereObj || {}

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

    if (where['shift_code']) {
      where['shift.code'] = where['shift_code']
      delete where['shift_code']
    }
    where['posting'] = true

    $stores_in.findMany({
      where: where,
      sort: { id: -1 }
    }, (err, docs) => {
      if (!err && docs)
        callback(docs)
      else callback(false)

    })
  }

}