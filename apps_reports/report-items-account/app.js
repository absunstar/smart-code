module.exports = function init(site) {
  const $account_invoices = site.connectCollection('account_invoices');
  const $item_transaction = site.connectCollection('item_transaction');

  site.get({
    name: 'report_items_account',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.post('/api/report_items_account/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.data.where || {};

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i');
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }

    let date1 = undefined;
    let date_from = undefined;
    let date_to = undefined;

    if (req.data.where) {
      if (req.data.where.date) date1 = new Date(req.data.where.date);
      if (req.data.where.date_from) date_from = new Date(req.data.where.date_from);
      if (req.data.where.date_to) date_to = new Date(req.data.where.date_to);
    }

    if (where.date) {
      let d1 = site.toDate(where.date);
      let d2 = site.toDate(where.date);
      d2.setDate(d2.getDate() + 1);
      where['date'] = {
        $gte: d1,
        $lt: d2,
      };
      delete where.date;
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from);
      let d2 = site.toDate(where.date_to);
      d2.setDate(d2.getDate() + 1);
      where['date'] = {
        $gte: d1,
        $lt: d2,
      };
      delete where.date_from;
      delete where.date_to;
    }

    if (where['vendor']) {
      where['vendor.id'] = where['vendor'].id;
      delete where['vendor'];
    } else where['vendor.id'] = { $gte: 1 };

    // where['remain_amount'] = { $gte: 1 };
    // where['payable_list.value'] = { $gte: 1 };

    where['company.id'] = site.get_company(req).id;
    where['branch.code'] = site.get_branch(req).code;
    $item_transaction.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || { id: -1 },
        limit: req.body.limit,
      },
      (err, docs, count) => {
        if (!err && docs && docs.length > 0) {
          let list = [];
          docs.forEach((_doc) => {
            if (_doc.vendor && _doc.vendor.id) {
              let found = false;
              list.forEach((_list) => {
                if (_doc.barcode == _list.barcode && _doc.unit.id == _list.unit.id) {
                  found = true;
                  if (_doc.transaction_type == 'in') {
                    _list.supplied_quantity = _list.supplied_quantity + _doc.count;
                    _list.total_price_supplied = _list.total_price_supplied + _doc.count * _doc.cost;
                  } else if (_doc.transaction_type == 'out') {
                    _list.sold_quantity = _list.sold_quantity + _doc.count;
                    _list.total_price_sold = _list.total_price_sold + _doc.count * _doc.cost;
                  }
                  _list.remaining_in_stock = _list.supplied_quantity - _list.sold_quantity
                }
              });
              if (!found) {
                let obj = {
                  barcode: _doc.barcode,
                  name_ar: _doc.name_ar,
                  name_en: _doc.name_en,
                  size_ar: _doc.size_ar,
                  size_en: _doc.size_en,
                  unit: _doc.unit,
                  price: _doc.price,
                  cost: _doc.cost,
                  supplied_quantity: _doc.transaction_type == 'in' ? _doc.count : 0,
                  sold_quantity: _doc.transaction_type == 'out' ? _doc.count : 0,
                  total_price_supplied: _doc.transaction_type == 'in' ? _doc.cost * _doc.count : 0,
                  total_price_sold: _doc.transaction_type == 'out' ? _doc.cost * _doc.count : 0,
                };

                obj.remaining_in_stock = obj.supplied_quantity - obj.sold_quantity;
                list.push(obj);
              }
            }
          });
          response.total_price_supplied = 0
          response.total_price_sold = 0
          list.forEach(_list => {
            response.total_price_supplied += _list.total_price_supplied
            response.total_price_sold += _list.total_price_sold
          });

          response.done = true;
          response.list = list;
          response.count = count;
        } else {
          response.error = 'Not Found';
        }
        res.json(response);
      }
    );
  });
};
