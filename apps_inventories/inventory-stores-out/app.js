module.exports = function init(site) {
  const $stores_out = site.connectCollection('stores_out');

  // $stores_out.deleteDuplicate({ code: 1 }, (err, result) => {
  //   $stores_out.createUnique({ code: 1 }, (err, result) => {
  //   })
  // })

  // site.on('[order_invoice][store_out][posting]', function (id) {
  //   $stores_out.findOne({ id: id }, (err, doc) => {
  //     doc.posting = true
  //     $stores_out.update(doc);
  //   });
  // });

  site.on('[stores_items][item_name][change]', (objectStoreOut) => {
    let barcode = objectStoreOut.sizes_list.map((_obj) => _obj.barcode);

    $stores_out.findMany({ 'company.id': objectStoreOut.company.id, 'items.barcode': barcode }, (err, doc) => {
      doc.forEach((_doc) => {
        if (_doc.items)
          _doc.items.forEach((_items) => {
            if (objectStoreOut.sizes_list)
              objectStoreOut.sizes_list.forEach((_size) => {
                if (_items.barcode === _size.barcode) {
                  _items.size_ar = _size.size_ar;
                  _items.size_en = _size.size_en;
                  _items.name_ar = _size.name_ar;
                  _items.name_en = _size.name_en;
                }
              });
          });
        $stores_out.update(_doc);
      });
    });
  });

  site.on('[store_out][account_invoice][invoice]', (obj, callback, next) => {
    $stores_out.findOne({ id: obj }, (err, doc) => {
      if (doc) {
        doc.invoice = true;
        $stores_out.update(doc, () => {
          next();
        });
      } else {
        next();
      }
    });
  });

  site.on('[store_out_order][account_invoice][invoice]', (obj, callback, next) => {
    $stores_out.findOne({ order_id: obj }, (err, doc) => {
      if (doc) {
        doc.invoice = true;
        $stores_out.update(doc, () => {
          next();
        });
      } else {
        next();
      }
    });
  });

  site.post({
    name: '/api/stores_out/types/all',
    path: __dirname + '/site_files/json/types.json',
  });

  site.get({
    name: 'stores_out',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: false,
  });

  site.post('/api/stores_out/add', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    let stores_out_doc = req.body;
    stores_out_doc.$req = req;
    stores_out_doc.$res = res;

    stores_out_doc.company = site.get_company(req);
    stores_out_doc.branch = site.get_branch(req);

    stores_out_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!stores_out_doc.payment_type && stores_out_doc.type.id != 5) {
      response.error = 'Must Choose Payment Type';
      res.json(response);
      return;
    }

    if (stores_out_doc.paid_up > stores_out_doc.net_value) {
      response.error = 'Paid Up Greater Than Net Value';
      res.json(response);
      return;
    }

    if (stores_out_doc.paid_up < stores_out_doc.net_value && stores_out_doc.payment_type && stores_out_doc.payment_type.id == 1) {
      response.error = 'The amount must be paid in full';
      res.json(response);
      return;
    }

    if (stores_out_doc && stores_out_doc.payable_list && stores_out_doc.payable_list.length > 0) {
      let _num = 0;
      for (let i = 0; i < stores_out_doc.payable_list.length; i++) {
        let p = stores_out_doc.payable_list[i];
        p.done = false;
        p.paid_up = 0;
        p.remain = p.value;
        _num += p.value;
      }
      if (stores_out_doc.payment_type && stores_out_doc.payment_type.id == 2) {
        let remain = stores_out_doc.net_value - stores_out_doc.paid_up;
        if (_num > remain) {
          response.error = 'value of batches is greater than the remain of the invoice';
          res.json(response);
          return;
        }
      }
    }

    site.getOpenShift(
      {
        companyId: stores_out_doc.company.id,
        branchCode: stores_out_doc.branch.code,
      },
      (shiftCb) => {
        if (shiftCb) {
          site.isAllowedDate(req, (allowDate) => {
            if (!allowDate) {
              response.error = 'Don`t Open Period';
              res.json(response);
            } else {
              if (stores_out_doc.type.id == 5) {
                delete stores_out_doc.customer;
                delete stores_out_doc.delegate;
              }
              site.call('[prices_offers][stores_out][invoice]', stores_out_doc);

              stores_out_doc.items.forEach((_itm) => {
                _itm.current_count = site.toNumber(_itm.current_count);
                _itm.count = site.toNumber(_itm.count);
                _itm.cost = site.toNumber(_itm.cost);
                _itm.price = site.toNumber(_itm.price);
                _itm.total = site.toNumber(_itm.total);
                delete _itm.show_max_dis;

                if (_itm.patch_list && _itm.patch_list.length > 0) {
                  let filter_patch = _itm.patch_list.filter((_p) => _p.count !== 0);
                  _itm.patch_list = filter_patch;
                }
              });

              stores_out_doc.total_value = site.toNumber(stores_out_doc.total_value);
              stores_out_doc.net_value = site.toNumber(stores_out_doc.net_value);

              if (stores_out_doc.type.id !== 5 && stores_out_doc.type.id !== 6) {
                stores_out_doc.return_paid = {
                  items: stores_out_doc.items,
                  total_discount: stores_out_doc.total_discount,
                  total_value_added: stores_out_doc.total_value_added,
                  total_tax: stores_out_doc.total_tax,
                  total_value: stores_out_doc.total_value,
                  net_value: stores_out_doc.net_value,
                };
              }

              site.isAllowOverDraft(req, req.body.items, (cbOverDraft) => {
                if (!cbOverDraft.overdraft && cbOverDraft.value && stores_out_doc.posting && stores_out_doc.type.id != 6) {
                  response.error = 'OverDraft Not Active';
                  res.json(response);
                } else {
                  let num_obj = {
                    company: site.get_company(req),
                    date: new Date(stores_out_doc.date),
                  };

                  if (stores_out_doc.type.id == 3 || stores_out_doc.type.id == 4) num_obj.screen = 'sales_invoices_store';
                  // else if (stores_out_doc.type.id == 4) num_obj.screen = 'o_screen_store';
                  else if (stores_out_doc.type.id == 5) num_obj.screen = 'damage_store';
                  else if (stores_out_doc.type.id == 6) num_obj.screen = 'return_sales_store';

                  let cb = site.getNumbering(num_obj);
                  if (!stores_out_doc.code && !cb.auto) {
                    response.error = 'Must Enter Code';
                    res.json(response);
                    return;
                  } else if (cb.auto) {
                    stores_out_doc.code = cb.code;
                  }
                  // if (stores_out_doc.Paid_from_customer) {
                  //   stores_out_doc.remain_from_customer =
                  //     stores_out_doc.Paid_from_customer -
                  //     stores_out_doc.amount_currency;
                  // } else {
                  //   stores_out_doc.Paid_from_customer = 0;
                  //   stores_out_doc.remain_from_customer = 0;
                  // }
                  // stores_out_doc.remain_from_customer = site.toNumber(
                  //   stores_out_doc.remain_from_customer
                  // );

                  $stores_out.add(stores_out_doc, (err, doc) => {
                    if (!err) {
                      response.done = true;
                      response.doc = doc;

                      if (doc.type && doc.type.id == 4) {
                        site.call('[store_out][order_invoice][data]', doc);
                      }

                      if (doc.posting) {
                        doc.items.forEach((_itm, i) => {
                          _itm.store = doc.store;
                          _itm.company = doc.company;
                          _itm.branch = doc.branch;
                          _itm.source_type = doc.type;
                          _itm.code = doc.code;
                          _itm.current_status = 'sold';
                          _itm.date = doc.date;
                          _itm.customer = doc.customer;
                          _itm.shift = {
                            id: doc.shift.id,
                            code: doc.shift.code,
                            name_ar: doc.shift.name_ar,
                            name_en: doc.shift.name_en,
                          };
                          if (doc.type.id == 6) {
                            _itm.returnSell = true;
                            _itm.type = 'sum';
                            _itm.count = -Math.abs(_itm.count);
                            _itm.transaction_type = 'out';
                            site.quee('item_transaction - items', Object.assign({}, _itm));
                            site.returnStoresOut(doc, (res) => {});
                          } else {
                            if (doc.type.id == 5) _itm.set_average = 'minus_average';

                            _itm.type = 'minus';
                            _itm.transaction_type = 'out';
                            site.quee('item_transaction - items', Object.assign({}, _itm));
                          }

                          _itm.count = Math.abs(_itm.count);
                          site.quee('[transfer_branch][stores_items][add_balance]', _itm);
                        });
                      }
                    } else {
                      response.error = err.message;
                    }
                    res.json(response);
                  });
                }
              });
            }
          });
        } else {
          response.error = 'Don`t Found Open Shift';
          res.json(response);
        }
      }
    );
  });

  site.post('/api/stores_out/update', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let stores_out_doc = req.body;
    stores_out_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    stores_out_doc.type = site.fromJson(stores_out_doc.type);
    stores_out_doc.date = new Date(stores_out_doc.date);

    site.getOpenShift(
      {
        companyId: stores_out_doc.company.id,
        branchCode: stores_out_doc.branch.code,
      },
      (shiftCb) => {
        if (shiftCb) {
          site.isAllowedDate(req, (allowDate) => {
            if (!allowDate) {
              response.error = 'Don`t Open Period';
              res.json(response);
            } else {
              if (stores_out_doc.type.id == 5) {
                delete stores_out_doc.customer;
                delete stores_out_doc.delegate;
              }

              stores_out_doc.items.forEach((_itm) => {
                _itm.count = site.toNumber(_itm.count);
                _itm.cost = site.toNumber(_itm.cost);
                _itm.price = site.toNumber(_itm.price);
                _itm.total = site.toNumber(_itm.total);

                if (_itm.patch_list && _itm.patch_list.length > 0) {
                  let filter_patch = _itm.patch_list.filter((_p) => _p.count !== 0);
                  _itm.patch_list = filter_patch;
                }
              });

              if (stores_out_doc.type.id !== 5 && stores_out_doc.type.id !== 6) {
                stores_out_doc.return_paid = {
                  items: stores_out_doc.items,
                  total_discount: stores_out_doc.total_discount,
                  total_value_added: stores_out_doc.total_value_added,
                  total_tax: stores_out_doc.total_tax,
                  total_value: stores_out_doc.total_value,
                  net_value: stores_out_doc.net_value,
                };
              }

              stores_out_doc.total_value = site.toNumber(stores_out_doc.total_value);

              if (stores_out_doc._id) {
                $stores_out.edit(
                  {
                    where: {
                      _id: stores_out_doc._id,
                    },
                    set: stores_out_doc,
                    $req: req,
                    $res: res,
                  },
                  (err) => {
                    if (!err) {
                      response.done = true;
                    } else {
                      response.error = err.message;
                    }
                    res.json(response);
                  }
                );
              } else {
                res.json(response);
              }
            }
          });
        } else {
          response.error = 'Don`t Found Open Shift';
          res.json(response);
        }
      }
    );
  });

  site.post('/api/stores_out/posting', (req, res) => {
    let response = {};

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    response.done = false;

    let stores_out_doc = req.body;

    site.getDefaultSetting(req, (settingCallback) => {
      if (stores_out_doc.invoice && !stores_out_doc.posting && settingCallback.accounting && !settingCallback.accounting.link_warehouse_account_invoices) {
        response.error = 'It`s Have Account Invoice';
        res.json(response);
      } else {
        site.getOpenShift(
          {
            companyId: stores_out_doc.company.id,
            branchCode: stores_out_doc.branch.code,
          },
          (shiftCb) => {
            if (shiftCb) {
              site.isAllowedDate(req, (allowDate) => {
                if (!allowDate) {
                  response.error = 'Don`t Open Period';
                  res.json(response);
                } else {
                  if (stores_out_doc.type.id !== 5 && stores_out_doc.type.id !== 6)
                    stores_out_doc.return_paid = {
                      items: stores_out_doc.items,
                      total_discount: stores_out_doc.total_discount,
                      total_value_added: stores_out_doc.total_value_added,
                      total_tax: stores_out_doc.total_tax,
                      total_value: stores_out_doc.total_value,
                      net_value: stores_out_doc.net_value,
                    };

                  stores_out_doc.edit_user_info = site.security.getUserFinger({
                    $req: req,
                    $res: res,
                  });

                  site.isAllowOverDraft(req, req.body.items, (cbOverDraft) => {
                    if (!cbOverDraft.overdraft && cbOverDraft.value && stores_out_doc.posting && stores_out_doc.type.id != 6) {
                      response.error = 'OverDraft Not Active';
                      res.json(response);
                    } else if (!cbOverDraft.overdraft && cbOverDraft.value && !stores_out_doc.posting && stores_out_doc.type.id == 6) {
                      response.error = 'OverDraft Not Active';
                      res.json(response);
                    } else {
                      if (stores_out_doc._id) {
                        $stores_out.edit(
                          {
                            where: {
                              _id: stores_out_doc._id,
                            },
                            set: stores_out_doc,
                            $req: req,
                            $res: res,
                          },
                          (err, result) => {
                            if (!err) {
                              response.done = true;
                              response.doc = result.doc;
                              if (result.doc.items && result.doc.items.length > 0) {
                                result.doc.items.forEach((_itm, i) => {
                                  _itm.store = result.doc.store;
                                  _itm.company = result.doc.company;
                                  _itm.branch = result.doc.branch;
                                  _itm.source_type = result.doc.type;
                                  _itm.code = result.doc.code;
                                  _itm.customer = result.doc.customer;
                                  _itm.date = result.doc.date;
                                  _itm.shift = {
                                    id: result.doc.shift.id,
                                    code: result.doc.shift.code,
                                    name_ar: result.doc.shift.name_ar,
                                    name_en: result.doc.shift.name_en,
                                  };
                                  if (result.doc.posting) {
                                    _itm.current_status = 'sold';
                                    if (result.doc.type.id == 6) {
                                      _itm.returnSell = true;
                                      _itm.type = 'sum';
                                      _itm.count = -Math.abs(_itm.count);
                                      _itm.transaction_type = 'out';
                                      site.quee('item_transaction - items', Object.assign({}, _itm));
                                    } else {
                                      if (result.doc.type.id == 5) {
                                        _itm.set_average = 'minus_average';
                                      }

                                      _itm.type = 'minus';
                                      _itm.transaction_type = 'out';
                                      site.quee('item_transaction - items', Object.assign({}, _itm));
                                    }
                                  } else {
                                    _itm.current_status = 'r_sold';
                                    if (result.doc.type.id == 6) {
                                      _itm.type = 'minus';
                                      _itm.transaction_type = 'out';
                                      site.quee('item_transaction - items', Object.assign({}, _itm));
                                    } else {
                                      if (result.doc.type.id == 5) {
                                        _itm.set_average = 'sum_average';
                                      } else {
                                        _itm.returnSell = true;
                                      }
                                      _itm.type = 'sum';
                                      _itm.count = -Math.abs(_itm.count);
                                      _itm.transaction_type = 'out';
                                      site.quee('item_transaction - items', Object.assign({}, _itm));
                                    }
                                  }
                                  _itm.count = Math.abs(_itm.count);
                                  site.quee('[transfer_branch][stores_items][add_balance]', _itm);
                                });
                              }

                              if (result.doc.type && result.doc.type.id == 6) {
                                if (!result.doc.posting) result.doc.return = true;
                                site.returnStoresOut(result.doc, (res) => {});
                              }
                            } else {
                              response.error = err.message;
                            }
                            res.json(response);
                          }
                        );
                      } else {
                        res.json(response);
                      }
                    }
                  });
                }
              });
            } else {
              response.error = 'Don`t Found Open Shift';
              res.json(response);
            }
          }
        );
      }
    });
  });

  site.post('/api/stores_out/delete', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let stores_out_doc = req.body;

    site.getDefaultSetting(req, (settingCallback) => {
      if (stores_out_doc.invoice && settingCallback.accounting && !settingCallback.accounting.link_warehouse_account_invoices) {
        response.error = 'It`s Have Account Invoice';
        res.json(response);
      } else {
        site.getOpenShift(
          {
            companyId: stores_out_doc.company.id,
            branchCode: stores_out_doc.branch.code,
          },
          (shiftCb) => {
            if (shiftCb) {
              site.isAllowedDate(req, (allowDate) => {
                if (!allowDate) {
                  response.error = 'Don`t Open Period';
                  res.json(response);
                } else {
                  site.isAllowOverDraft(req, req.body.items, (cbOverDraft) => {
                    if (!cbOverDraft.overdraft && cbOverDraft.value && stores_out_doc.posting && stores_out_doc.type.id == 6) {
                      response.error = 'OverDraft Not Active';
                      res.json(response);
                    } else {
                      if (stores_out_doc._id) {
                        $stores_out.delete(
                          {
                            where: {
                              _id: stores_out_doc._id,
                            },
                            $req: req,
                            $res: res,
                          },
                          (err, result) => {
                            if (!err) {
                              response.done = true;
                              if (stores_out_doc.posting) {
                                stores_out_doc.items.forEach((_itm, i) => {
                                  _itm.source_type = stores_out_doc.type;
                                  _itm.store = stores_out_doc.store;
                                  _itm.company = stores_out_doc.company;
                                  _itm.branch = stores_out_doc.branch;
                                  _itm.code = stores_out_doc.code;
                                  _itm.customer = stores_out_doc.customer;
                                  _itm.date = stores_out_doc.date;
                                  _itm.current_status = 'd_sold';
                                  _itm.shift = {
                                    id: stores_out_doc.shift.id,
                                    code: stores_out_doc.shift.code,
                                    name_ar: stores_out_doc.shift.name_ar,
                                    name_en: stores_out_doc.shift.name_en,
                                  };
                                  if (result.doc.type.id == 6) {
                                    _itm.type = 'minus';
                                    _itm.transaction_type = 'out';
                                    _itm.count = -Math.abs(_itm.count);
                                    site.quee('item_transaction - items', Object.assign({}, _itm));
                                  } else {
                                    if (result.doc.type.id == 5) _itm.set_average = 'sum_average';
                                    else _itm.returnSell = true;

                                    _itm.type = 'sum';
                                    _itm.transaction_type = 'out';
                                    site.quee('item_transaction - items', Object.assign({}, _itm));
                                  }

                                  _itm.count = Math.abs(_itm.count);
                                  site.quee('[transfer_branch][stores_items][add_balance]', _itm);
                                });
                                if (result.doc.type && result.doc.type.id == 6) {
                                  result.doc.return = true;
                                  site.returnStoresOut(result.doc, (res) => {});
                                }
                              }
                            }
                            res.json(response);
                          }
                        );
                      } else {
                        res.json(response);
                      }
                    }
                  });
                }
              });
            } else {
              response.error = 'Don`t Found Open Shift';
              res.json(response);
            }
          }
        );
      }
    });
  });

  site.post('/api/stores_out/view', (req, res) => {
    let response = {};
    response.done = false;

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    where = {};
    if (req.body.id) {
      where['id'] = req.body.id;
    }

    if (req.body.order_id) {
      where['order_id'] = req.body.order_id;
    }

    $stores_out.findOne(
      {
        where: where,
      },
      (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/stores_out/all', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};
    let limit = where.limit || undefined;
    let search = req.body.search || '';

    if (search) {
      where.$or = [];
      where.$or.push({
        'code': search,
      });   

      where.$or.push({
        'customer.name_ar': site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        'customer.name_en': site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        'customer.mobile': site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        'customer.phone': site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        'customer.national_id': site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        'customer.email': site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        'store.name': site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        'store.type.ar': site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        'store.type.en': site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        'store.payment_method.ar': site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        'store.payment_method.en': site.get_RegExp(search, 'i'),
      });
    }

    where['company.id'] = site.get_company(req).id;

    if (where['branchAll']) {
      delete where['branchAll'];
    } else {
      where['branch.code'] = site.get_branch(req).code;
    }

    if (where && where['notes']) {
      where['notes'] = site.get_RegExp(where['notes'], 'i');
    }

    if (where && where['code']) {
      where['code'] = where['code'];
    }

    if (where && where['limit']) {
      delete where['limit'];
    }

    if (where && where['supply_number']) {
      where['supply_number'] = site.get_RegExp(where['supply_number'], 'i');
    }

    if (where.date) {
      let d1 = site.toDate(where.date);
      let d2 = site.toDate(where.date);
      d2.setDate(d2.getDate() + 1);
      where.date = {
        $gte: d1,
        $lt: d2,
      };
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from);
      let d2 = site.toDate(where.date_to);
      d2.setDate(d2.getDate() + 1);
      where.date = {
        $gte: d1,
        $lt: d2,
      };
      delete where.date_from;
      delete where.date_to;
    }

    if (where['name']) {
      where['items.name'] = site.get_RegExp(where['name'], 'i');
      delete where['name'];
    }

    if (where['size_ar']) {
      where['items.size_ar'] = site.get_RegExp(where['size_ar'], 'i');
      delete where['size_ar'];
    }

    if (where['size_en']) {
      where['items.size_en'] = site.get_RegExp(where['size_en'], 'i');
      delete where['size_en'];
    }

    if (where['barcode']) {
      where['items.barcode'] = where['barcode'];
      delete where['barcode'];
    }

    if (where['shift_code']) {
      where['shift.code'] = where['shift_code'];
      delete where['shift_code'];
    }

    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer'];
    }

    if (where['delegate']) {
      where['delegate.id'] = where['delegate'].id;
      delete where['delegate'];
    }

    if (where['post']) {
      where['posting'] = true;
      delete where['post'];
    }
    if (where['un_post']) {
      where['$or'] = [{ posting: false }, { posting: undefined }];
      delete where['un_post'];
    }

    if (where['type']) {
      if (where['type'].id == 3) {
        where.$or = where.$or || [];
        where.$or.push(
          {
            'type.id': where['type'].id,
          },
          {
            'type.id': 4,
          }
        );
      } else {
        where['type.id'] = where['type'].id;
      }
      delete where['type'];
    }

    if (where['source']) {
      where['source.id'] = where['source'].id;
      delete where['source'];
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

    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method'];
    }

    if (where['safe']) {
      where['safe.id'] = where['safe'].id;
      delete where['safe'];
    }

    if (where['value']) {
      where['value'] = where['value'];
    }

    if (where['description']) {
      where['description'] = site.get_RegExp(where['description'], 'i');
    }

    if (req.session.user && req.session.user.type === 'delegate') {
      where['delegate.id'] = req.session.user.ref_info.id;
    }
    console.log(where);
    $stores_out.findMany(
      {
        select: req.body.select || {},
        limit: limit,
        where: where,
        sort: { id: -1 },
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          response.count = docs.length;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/stores_out/handel_store_out', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    where['company.id'] = site.get_company(req).id;

    $stores_out.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
      },
      (err, docs) => {
        if (!err) {
          response.done = true;

          site.getDefaultSetting(req, (callback) => {
            let unit = {};
            if (callback.inventory.unit) unit = callback.inventory.unit;

            if (unit.id) {
              docs.forEach((_doc) => {
                _doc.items.forEach((_item) => {
                  if (_item.unit == null || undefined)
                    _item.unit = {
                      id: unit.id,
                      name_ar: unit.name_ar,
                      name_en: unit.name_en,
                      convert: 1,
                    };
                });

                if (_doc.type.id !== 5 && _doc.type.id !== 6)
                  _doc.return_paid = {
                    items: _doc.items,
                    total_discount: _doc.total_discount,
                    total_value_added: _doc.total_value_added,
                    total_tax: _doc.total_tax,
                    total_value: _doc.total_value,
                    net_value: _doc.net_value,
                  };
                $stores_out.update(_doc);
              });
            }
          });
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.returnStoresOut = function (obj, res) {
    $stores_out.findOne({ id: obj.retured_id }, (err, doc) => {
      if (doc && doc.return_paid) {
        obj.items.forEach((_itemsObj) => {
          doc.return_paid.items.forEach((_itemsDoc) => {
            if (_itemsObj.barcode === _itemsDoc.barcode && _itemsObj.size_ar === _itemsDoc.size_ar) {
              if (_itemsObj.patch_list && _itemsObj.patch_list.length > 0) {
                if (_itemsDoc.patch_list && _itemsDoc.patch_list.length > 0) {
                  let foundPatshList = [];

                  _itemsObj.patch_list.forEach((objPatch) => {
                    let foundPatsh = _itemsDoc.patch_list.some((_p1) => objPatch.patch === _p1.patch);

                    if (!foundPatsh) foundPatshList.push(objPatch);

                    _itemsDoc.patch_list.forEach((docPatch) => {
                      if (objPatch.patch === docPatch.patch) {
                        if (obj.return) {
                          docPatch.count = docPatch.count + objPatch.count;
                        } else {
                          docPatch.count = docPatch.count - objPatch.count;
                        }
                      }
                    });
                  });
                  if (obj.return) {
                    foundPatshList.forEach((fP) => {
                      _itemsDoc.patch_list.push(fP);
                    });
                  } else {
                    let filter_patch = _itemsDoc.patch_list.filter((_p) => _p.count !== 0);
                    _itemsDoc.patch_list = filter_patch;

                    if (_itemsDoc.patch_list.length === 1 && _itemsDoc.patch_list[0].count === 0) _itemsDoc.patch_list = [];
                  }
                }
              }

              if (obj.return) _itemsDoc.count = _itemsDoc.count + _itemsObj.count;
              else _itemsDoc.count = _itemsDoc.count - _itemsObj.count;

              let discount = 0;
              if (_itemsDoc.discount) {
                if (_itemsDoc.discount.type == 'code') discount = _itemsDoc.discount.value * _itemsDoc.count;
                else if (_itemsDoc.discount.type == 'percent') discount = (_itemsDoc.discount.value * (_itemsDoc.price * _itemsDoc.count)) / 100;
              }

              _itemsDoc.total = _itemsDoc.count * _itemsDoc.price - discount;
            }
          });
        });
        if (obj.return) {
          doc.return_paid.total_value_added = doc.return_paid.total_value_added + obj.total_value_added;
          doc.return_paid.total_discount = doc.return_paid.total_discount + obj.total_discount;
          doc.return_paid.total_tax = doc.return_paid.total_tax + obj.total_tax;
          doc.return_paid.total_value = doc.return_paid.total_value + obj.total_value;
          doc.return_paid.net_value = doc.return_paid.net_value + obj.net_value;
        } else {
          doc.return_paid.total_value_added = doc.return_paid.total_value_added - obj.total_value_added;
          doc.return_paid.total_discount = doc.return_paid.total_discount - obj.total_discount;
          doc.return_paid.total_tax = doc.return_paid.total_tax - obj.total_tax;
          doc.return_paid.total_value = doc.return_paid.total_value - obj.total_value;
          doc.return_paid.net_value = doc.return_paid.net_value - obj.net_value;
        }
        doc.return_paid.total_value_added = site.toNumber(doc.return_paid.total_value_added);
        doc.return_paid.total_discount = site.toNumber(doc.return_paid.total_discount);
        doc.return_paid.total_tax = site.toNumber(doc.return_paid.total_tax);
        doc.return_paid.total_value = site.toNumber(doc.return_paid.total_value);
        doc.return_paid.net_value = site.toNumber(doc.return_paid.net_value);
        $stores_out.update(doc);
      }
    });
  };

  site.post('/api/stores_out/un_post', (req, res) => {
    let response = {};
    response.done = false;
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $stores_out.findMany(
      {
        select: req.body.select || {},
        where: { 'company.id': site.get_company(req).id },
        sort: req.body.sort || {
          id: -1,
        },
      },
      (err, docs) => {
        if (!err) {
          docs.forEach((stores_out_doc) => {
            stores_out_doc.posting = false;
            stores_out_doc.return_paid = null;
            $stores_out.update(stores_out_doc);
          });
        }
        response.done = true;
        res.json(response);
      }
    );
  });

  site.post('/api/stores_out/post_all', (req, res) => {
    let response = {};
    response.done = false;
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $stores_out.findMany(
      {
        select: req.body.select || {},
        where: { 'company.id': site.get_company(req).id },
      },
      (err, docs) => {
        if (!err) {
          docs.forEach((stores_out_doc) => {
            req.body.store = stores_out_doc.store;
            req.body.branch = stores_out_doc.branch;
            site.isAllowOverDraft(Object.assign({}, req), req.body.items, (cbOverDraft) => {
              if (!cbOverDraft.overdraft && cbOverDraft.value && stores_out_doc.type.id != 6) {
                response.error = 'OverDraft Not Active';
                res.json(response);
              } else {
                stores_out_doc.posting = true;

                if (stores_out_doc._id) {
                  $stores_out.edit(
                    {
                      where: {
                        _id: stores_out_doc._id,
                      },
                      set: stores_out_doc,
                      $req: req,
                      $res: res,
                    },
                    (err, result) => {
                      if (!err) {
                        response.done = true;
                        response.doc = result.doc;

                        result.doc.items.forEach((_itm, i) => {
                          _itm.store = result.doc.store;
                          _itm.company = result.doc.company;
                          _itm.branch = result.doc.branch;
                          _itm.source_type = result.doc.type;
                          _itm.code = result.doc.code;
                          _itm.customer = result.doc.customer;
                          _itm.date = result.doc.date;
                          _itm.shift = {
                            id: result.doc.shift.id,
                            code: result.doc.shift.code,
                            name_ar: result.doc.shift.name_ar,
                            name_en: result.doc.shift.name_en,
                          };
                          _itm.current_status = 'sold';
                          if (result.doc.type.id == 6) {
                            _itm.returnSell = true;
                            _itm.type = 'sum';
                            _itm.count = -Math.abs(_itm.count);
                            _itm.transaction_type = 'out';
                            site.quee('item_transaction - items', Object.assign({}, _itm));
                          } else {
                            if (result.doc.type.id == 5) {
                              _itm.set_average = 'minus_average';
                            }

                            _itm.type = 'minus';
                            _itm.transaction_type = 'out';
                            site.quee('item_transaction - items', Object.assign({}, _itm));
                          }

                          _itm.count = Math.abs(_itm.count);
                          site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _itm));
                        });

                        if (result.doc.type && result.doc.type.id == 6) {
                          if (!result.doc.posting) result.doc.return = true;
                          site.returnStoresOut(result.doc, (res) => {});
                        }
                      } else {
                        response.error = err.message;
                      }
                      res.json(response);
                    }
                  );
                } else {
                  res.json(response);
                }
              }
            });
          });
        }

        response.done = true;
        res.json(response);
      }
    );
  });

  site.getStoresOut = function (whereObj, callback) {
    callback = callback || {};
    let where = whereObj || {};

    if (where.date) {
      let d1 = site.toDate(where.date);
      let d2 = site.toDate(where.date);
      d2.setDate(d2.getDate() + 1);
      where.date = {
        $gte: d1,
        $lt: d2,
      };
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from);
      let d2 = site.toDate(where.date_to);
      d2.setDate(d2.getDate() + 1);
      where.date = {
        $gte: d1,
        $lt: d2,
      };
      delete where.date_from;
      delete where.date_to;
    }

    if (where['shift_code']) {
      where['shift.code'] = where['shift_code'];
      delete where['shift_code'];
    }
    where['posting'] = true;

    $stores_out.findMany(
      {
        where: where,
        sort: { id: -1 },
      },
      (err, docs) => {
        if (!err && docs) callback(docs);
        else callback(false);
      }
    );
  };

  //   site.getStoresOut = function (req, callback) {
  //    callback = callback || {};

  //    let where = req.data.where || {};
  //    where['company.id'] = site.get_company(req).id
  //    where['branch.code'] = site.get_branch(req).code
  //    where['invoice'] = false
  //    $stores_out.findOne({
  //      where: where
  //    }, (err, doc) => {
  //      if (!err && doc)
  //        callback(doc)
  //      else callback(false)
  //    })
  //  }
};
