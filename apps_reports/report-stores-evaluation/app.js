module.exports = function init(site) {
  const $stores_items = site.connectCollection("stores_items")

  site.get({
    name: "report_stores_evaluation",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_stores_evaluation/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};
    let store_id = 0;

    if (where.store) store_id = where.store.id
    // let branch_code = null

    // if (where.branch && where.branch.code)
    //   branch_code = where.branch.code

    where['company.id'] = site.get_company(req).id


    if (where && where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    }

    if (where && where['size']) {
      where['sizes.size'] = new RegExp(where['size'], 'i')
      delete where['size']
    }

    if (where && where['size_en']) {
      where['sizes.size_en'] = new RegExp(where['size_en'], 'i')
      delete where['size_en']
    }

    if (where && where['barcode']) {
      where['sizes.barcode'] = new RegExp(where['barcode'], 'i')
      delete where['barcode']
    }

    if (where['branch'] && where['branch'].code) {
      where['sizes.branches_list.code'] = where['branch'].code
      delete where['branch']
    }


    if (where['store'] && where['store'].id) {
      where['sizes.branches_list.stores_list.store.id'] = where['store'].id
      delete where['store']
    }

    if (where['item_group'] && where['item_group'].id) {
      where['item_group.id'] = where['item_group'].id
      delete where['item_group']
    }

    $stores_items.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err1, docs) => {
      if (!err1) {

        let i_store_list = [];

        docs.forEach(_doc => {
          if (_doc.sizes && _doc.sizes.length > 0)
            _doc.sizes.forEach(_sizes => {
              if (_sizes.branches_list && _sizes.branches_list.length > 0)
                _sizes.branches_list.forEach(_branch => {
                  _branch.stores_list.forEach(_store => {
                    if (_store.store.id == store_id) {

                      i_store_list.push({
                        name: _doc.name,
                        item_group: _doc.item_group,
                        size: _sizes.size,
                        barcode: _sizes.barcode,
                        size_en: _sizes.size_en,
                        average_cost: _sizes.average_cost,
                        size_units_list: _sizes.size_units_list,
                        store_units_list: _store.size_units_list
                      })
                    }
                  });
                });
            })
        })

        i_store_list.forEach(_iStore => {
          if (_iStore.size_units_list && _iStore.size_units_list.length > 0)
            _iStore.size_units_list.forEach(_size_units => {
              if (_iStore.store_units_list && _iStore.store_units_list.length > 0)
                _iStore.store_units_list.forEach(_store_units => {
                  if (_size_units.id == _store_units.id) {
                    _store_units.average_cost = _size_units.average_cost
                    _store_units.total_average_cost = _size_units.average_cost * _store_units.current_count

                    _store_units.average_cost = site.toNumber(_store_units.average_cost)
                    _store_units.total_average_cost = site.toNumber(_store_units.total_average_cost)
                  }
                });
            });
        });

        response.done = true
        response.doc = i_store_list
        res.json(response)

      } else {
        response.error = err.message
      }
    })

  })

}