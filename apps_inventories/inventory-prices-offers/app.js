module.exports = function init(site) {
  const $prices_offers = site.connectCollection('prices_offers');

  // $prices_offers.deleteDuplicate({ code: 1 }, (err, result) => {
  //   $prices_offers.createUnique({ code: 1 }, (err, result) => {
  //   })
  // })

  // site.on('[order_invoice][prices_offers][posting]', function (id) {
  //   $prices_offers.findOne({ id: id }, (err, doc) => {
  //     doc.posting = true
  //     $prices_offers.update(doc);
  //   });
  // });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'prices_offers',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: false,
  });

  site.on('[prices_offers][stores_out][invoice]', (obj, callback) => {
    $prices_offers.findOne({ id: obj.prices_offers_id }, (err, doc) => {
      if (doc) {
        doc.invoice = true;
        doc.store_out_id = obj.id;
        $prices_offers.update(doc, () => {
        });
      }
    });
  });

  site.post('/api/prices_offers/add', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    let prices_offers_doc = req.body;
    prices_offers_doc.$req = req;
    prices_offers_doc.$res = res;

    prices_offers_doc.company = site.get_company(req);
    prices_offers_doc.branch = site.get_branch(req);

    prices_offers_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    site.getOpenShift(
      {
        companyId: prices_offers_doc.company.id,
        branchCode: prices_offers_doc.branch.code,
      },
      (shiftCb) => {
        if (shiftCb) {
          site.isAllowedDate(req, (allowDate) => {
            if (!allowDate) {
              response.error = 'Don`t Open Period';
              res.json(response);
            } else {
              prices_offers_doc.items.forEach((_itm) => {
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

              prices_offers_doc.total_value = site.toNumber(prices_offers_doc.total_value);
              prices_offers_doc.net_value = site.toNumber(prices_offers_doc.net_value);
              let num_obj = {
                company: site.get_company(req),
                screen: 'prices_offers',
                date: new Date(),
              };

              let cb = site.getNumbering(num_obj);
              if (!prices_offers_doc.code && !cb.auto) {
                response.error = 'Must Enter Code';
                res.json(response);
                return;
              } else if (cb.auto) {
                prices_offers_doc.code = cb.code;
              }

              $prices_offers.add(prices_offers_doc, (err, doc) => {
                if (!err) {
                  response.done = true;
                  response.doc = doc;
                } else {
                  response.error = err.message;
                }
                res.json(response);
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

  site.post('/api/prices_offers/update', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let prices_offers_doc = req.body;
    prices_offers_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    prices_offers_doc.date = new Date(prices_offers_doc.date);

    site.getOpenShift(
      {
        companyId: prices_offers_doc.company.id,
        branchCode: prices_offers_doc.branch.code,
      },
      (shiftCb) => {
        if (shiftCb) {
          site.isAllowedDate(req, (allowDate) => {
            if (!allowDate) {
              response.error = 'Don`t Open Period';
              res.json(response);
            } else {
              prices_offers_doc.items.forEach((_itm) => {
                _itm.count = site.toNumber(_itm.count);
                _itm.cost = site.toNumber(_itm.cost);
                _itm.price = site.toNumber(_itm.price);
                _itm.total = site.toNumber(_itm.total);

                if (_itm.patch_list && _itm.patch_list.length > 0) {
                  let filter_patch = _itm.patch_list.filter((_p) => _p.count !== 0);
                  _itm.patch_list = filter_patch;
                }
              });

              prices_offers_doc.total_value = site.toNumber(prices_offers_doc.total_value);

              if (prices_offers_doc._id) {
                $prices_offers.edit(
                  {
                    where: {
                      _id: prices_offers_doc._id,
                    },
                    set: prices_offers_doc,
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

  site.post('/api/prices_offers/delete', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let prices_offers_doc = req.body;

    site.getDefaultSetting(req, (settingCallback) => {
      if (prices_offers_doc.invoice && settingCallback.accounting && !settingCallback.accounting.link_warehouse_account_invoices) {
        response.error = 'It`s Have Account Invoice';
        res.json(response);
      } else {
        site.getOpenShift(
          {
            companyId: prices_offers_doc.company.id,
            branchCode: prices_offers_doc.branch.code,
          },
          (shiftCb) => {
            if (shiftCb) {
              site.isAllowedDate(req, (allowDate) => {
                if (!allowDate) {
                  response.error = 'Don`t Open Period';
                  res.json(response);
                } else {
                  if (prices_offers_doc._id) {
                    $prices_offers.delete(
                      {
                        where: {
                          _id: prices_offers_doc._id,
                        },
                        $req: req,
                        $res: res,
                      },
                      (err, result) => {
                        if (!err) {
                          response.done = true;
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
      }
    });
  });

  site.post('/api/prices_offers/view', (req, res) => {
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

    $prices_offers.findOne(
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

  site.post('/api/prices_offers/all', (req, res) => {
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
        code: site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        net_value: search,
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

    if (where['value']) {
      where['value'] = where['value'];
    }

    if (where['description']) {
      where['description'] = site.get_RegExp(where['description'], 'i');
    }

    $prices_offers.findMany(
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
};
