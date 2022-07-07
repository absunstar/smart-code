module.exports = function init(site) {
  const $safes_payments = site.connectCollection('safes_payments');

  site.on('delete safe payment', function (id) {
    $safes_payments.findMany({ 'safe.id': id }, (err, docs) => {
      if (docs.length === 1) $safes_payments.delete(docs[0]);
    });
  });

  site.on('[safes][safes_payments][+]', (obj, callback, next) => {
    let info = {
      safe: obj.safe,
      payment_method: obj.payment_method,
      shift: obj.shift,
      value: obj.value || '',
      date: obj.date || obj.safe.date,
      source: obj.operation,
      transition_type: obj.transition_type,
      currency: obj.currency,
      company: obj.company,
      branch: obj.branch,
      balance: obj.balance || obj.safe.balance,
      image_url: obj.image_url || obj.safe.image_url,
      pre_balance: obj.pre_balance,
      invoice_type: obj.invoice_type,
      source_name_ar: obj.source_name_ar || '',
      source_name_en: obj.source_name_en || '',
      operation: obj.operation || '',
      description: obj.description || '',
      notes: obj.notes || '',
      code: obj.code || '',
    };

    info.pre_balance = site.toNumber(info.pre_balance);
    info.balance = site.toNumber(info.balance);

    $safes_payments.add(info, () => {
      next();
    });
  });

  site.get({
    name: 'safes_payments',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: false,
  });

  site.post('/api/safes_payments/all', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method'];
    }

    if (where['transition_type']) {
      where['transition_type'] = site.get_RegExp(where['transition_type.type'], 'i');
    }

    if (where['shift_code']) {
      where['shift.code'] = site.get_RegExp(where['shift_code'], 'i');
      delete where['shift_code'];
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

    if (where['source']) {
      where['source'] = site.get_RegExp(where['source'], 'i');
    }

    if (where['value']) {
      where['value'] = where['value'];
    }

    where['company.id'] = site.get_company(req).id;
    where['branch.code'] = site.get_branch(req).code;

    $safes_payments.findMany(
      {
        select: req.body.select || {},
        where: where,
        limit: req.body.limit,
        sort: {
          id: -1,
        },
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/safes_payments/handel_safes_payments', (req, res) => {
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

    where['currency'] = null || undefined;

    $safes_payments.findMany(
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
            let currency = {};
            if (callback.accounting.currency) currency = callback.accounting.currency;

            if (currency.id)
              docs.forEach((_doc) => {
                _doc.currency = currency;
                _doc.pre_balance = site.toNumber(_doc.pre_balance);
                _doc.balance = site.toNumber(_doc.balance);
                $safes_payments.update(_doc);
              });
          });
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/safes_payments/account_statement_shift', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    where['branch.code'] = site.get_branch(req).code;
    where['company.id'] = site.get_company(req).id;


    $safes_payments.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
      },
      (err, docs, count) => {
        if (!err) {
          let list = [];
          docs.forEach((_doc) => {
            let found = false;
            list.forEach((_list) => {
              if (_doc.safe.id == _list.safe.id) {
                found = true;
              _doc.value = site.toNumber(_doc.value);
              if (_doc.transition_type == 'in') {
                  _list.incoming_amount = _list.incoming_amount + _doc.value;
                } else if (_doc.transition_type == 'out') {
                  _list.outgoing_amount = _list.outgoing_amount + _doc.value;
                }
                _list.remain = _list.incoming_amount - _list.outgoing_amount;
              }
            });
            if (!found) {
              _doc.value = site.toNumber(_doc.value);
              let obj = {
                safe: _doc.safe,
                currency: _doc.currency,
                incoming_amount: _doc.transition_type == 'in' ? _doc.value : 0,
                outgoing_amount: _doc.transition_type == 'out' ? _doc.value : 0,
              };
              obj.remain = obj.incoming_amount - obj.outgoing_amount;

              list.push(obj);
            }
          });
          list.forEach(_a => {
            _a.incoming_amount = site.toNumber(_a.incoming_amount);
            _a.outgoing_amount = site.toNumber(_a.outgoing_amount);
            _a.remain = site.toNumber(_a.remain);
          });
          response.done = true;
          response.list = list;
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/safes_payments/drop', (req, res) => {
    let response = {};
    response.done = false;
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $safes_payments.deleteMany(
      {
        'company.id': site.get_company(req).id,
        $req: req,
        $res: res,
      },
      () => {
        response.done = true;
        res.json(response);
      }
    );
  });

  site.getAccountingDataToDelete = function (data, callback) {
    let where = {};

    if (data.name == 'safe') where['safe.id'] = data.id;
    else if (data.name == 'currency') where['currency.id'] = data.id;
    $safes_payments.findOne(
      {
        where: where,
      },
      (err, doc, count) => {
        if (!err) {
          if (doc) callback(true);
          else callback(false);
        }
      }
    );
  };
};
