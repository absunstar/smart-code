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

    if (where) {

      let size = where.size || '';
      let size_en = where.size_en || '';
      let barcode = where.barcode || '';

      where['company.id'] = site.get_company(req).id

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
        where['sizes.barcode'] = site.get_RegExp(where['barcode'], 'i')
        delete where['barcode']
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
              if (_sizes.branches_list && _sizes.branches_list.length > 0) {
                if (_sizes && (size || size_en || barcode) && ((_sizes.size && size && _sizes.size.contains(size)) || (_sizes.size_en && size_en && _sizes.size_en.contains(size_en)) || (_sizes.barcode && barcode && _sizes.barcode===barcode))) {

                  _sizes.name = _doc.name
                  _sizes.item_group = _doc.item_group
                  i_store_list.push(_sizes)
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
    }

  })

}