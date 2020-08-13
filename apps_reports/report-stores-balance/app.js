module.exports = function init(site) {
  const $stores_items = site.connectCollection("stores_items")

  site.get({
    name: "report_stores_balance",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_stores_balance/all", (req, res) => {
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
    let branch_code = '';
    let unit_id = 0;
    let size = where.size;
    let size_en = where.size_en;
    let barcode = where.barcode;

    if (where.store) store_id = where.store.id
    if (where.branch) branch_code = where.branch.code
    if (where.unit) unit_id = where.unit.id

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

    // if (where['branch'] && where['branch'].code) {
    //   where['sizes.branches_list.code'] = where['branch'].code
    //   delete where['branch']
    // }

    // if (where['store'] && where['store'].id) {
    //   where['sizes.branches_list.stores_list.store.id'] = where['store'].id
    //   delete where['store']
    // }

    // delete where['unit']

    // if (where['item_group'] && where['item_group'].id) {
    //   where['item_group.id'] = where['item_group'].id
    //   delete where['item_group']
    // }

    $stores_items.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err1, docs) => {
      if (!err1) {

        let i_store_list = [];


        docs.forEach(_doc => {
          _doc.sizes.forEach(_sizes => {
            if (_sizes.branches_list && _sizes.branches_list.length > 0) {
              if ((_sizes.size && _sizes.size.contains(size)) || (_sizes.size_en && _sizes.size_en.contains(size_en)) || (_sizes.barcode && _sizes.barcode.contains(barcode))) {
             
                _sizes.name = _doc.name
                _sizes.item_group = _doc.item_group
                i_store_list.push(_sizes)
                // _sizes.branches_list.forEach(_branch => {

                //   if (_branch.code == branch_code) {
                //     _branch.stores_list.forEach(_store => {
                //       if (_store.store.id == store_id) {

                //         if (_store.size_units_list && _store.size_units_list.length > 0) {

                //           _store.size_units_list.forEach(_unit => {
                //             if (_unit.id == unit_id) {

                //               i_store_list.push({
                //                 name: _doc.name,
                //                 item_group: _doc.item_group,
                //                 size: _sizes.size,
                //                 average_cost: _sizes.average_cost,
                //                 size_en: _sizes.size_en,
                //                 barcode: _sizes.barcode,
                //                 count: _unit.current_count
                //               })
                //             }
                //           });

                //         }
                //       }
                //     });
                //   }
                // });
              }

            }
          })
        })

        response.done = true
        response.doc = i_store_list
        res.json(response)

      } else {
        response.error = err.message
      }
    })

  })

}