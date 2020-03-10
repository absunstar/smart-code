module.exports = function init(site) {
  const $stores_items = site.connectCollection("stores_items")
  // const $stores_items = site.connectCollection("stores_items")

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
    let store_id = where.store.id

    where['company.id'] = site.get_company(req).id

    if (where['store'].id) {
      where['sizes.branches_list.stores_list.store.id'] = where['store'].id
      delete where['store']
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
          _doc.sizes.forEach(_sizes => {
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
          _iStore.size_units_list.forEach(_size_units => {
            _iStore.store_units_list.forEach(_store_units => {
              if (_size_units.id == _store_units.id) {
                _store_units.average_cost = _size_units.average_cost
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