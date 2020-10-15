module.exports = function init(site) {
  const $stores_items = site.connectCollection("stores_items")

  site.get({
    name: "report_stores_movement",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_stores_movement/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};
    let unit_id = 0;
    let count = 0;
    let type = {};

    if (where.unit) unit_id = where.unit.id
    if (where.unit) type = where.type
    if (where.unit) count = where.count

    where['company.id'] = site.get_company(req).id
    delete where['unit']
    delete where['type']
    delete where['count']

    if (where && where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }

    if (where && where['size']) {
      where['sizes.size'] = site.get_RegExp(where['size'], 'i')
      delete where['size']
    }

    if (where && where['size_en']) {
      where['sizes.size_en'] = site.get_RegExp(where['size_en'], 'i')
      delete where['size_en']
    }

    if (where && where['barcode']) {
      where['sizes.barcode'] =  where['barcode']
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
          _doc.sizes.forEach(_sizes => {
            if (_sizes.size_units_list && _sizes.size_units_list.length > 0) {
              let unitObj = {}

              _sizes.size_units_list.forEach(_unitSize => {
                if (_unitSize.id == unit_id) {
                  unitObj = _unitSize
                }
              });

              i_store_list.push({
                name: _doc.name,
                item_group: _doc.item_group,
                size: _sizes.size,
                average_cost: _sizes.average_cost,
                size_en: _sizes.size_en,
                barcode: _sizes.barcode,
                unit_obj: unitObj
              })
            }
          })
        })

        response.done = true
        if (type == 'stagnant_items') {
          response.doc = i_store_list.sort(function (a, b) { return a.unit_obj.total_sell_count - b.unit_obj.total_sell_count }).splice(0, count)
        }

        else if (type == 'best_seller') {
          response.doc = i_store_list.sort(function (a, b) { return b.unit_obj.total_sell_count - a.unit_obj.total_sell_count }).splice(0, count)
        }



        res.json(response)

      } else {
        response.error = err.message
      }
    })

  })

}