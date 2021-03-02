module.exports = function init(site) {
  const $stores_items = site.connectCollection("stores_items")

  site.get({
    name: "report_stores_re_order",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_stores_re_order/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};

    let branchCode = 0;
    let re_order_limit = 0;

    where['company.id'] = site.get_company(req).id

    if (where['branch'] && where['branch'].code) {
      branchCode = where['branch'].code
      re_order_limit = where['re_order_limit']
      where['sizes.branches_list.code'] = where['branch'].code
      delete where['branch']
      delete where['re_order_limit']
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

              _sizes.branches_list.forEach(_SizeBranch => {
                if (_SizeBranch.code == branchCode) {
                  let count = 0

                  if (re_order_limit) count = re_order_limit
                  else count = _SizeBranch.re_order_limit

                  if (count >= _SizeBranch.current_count) {
                    i_store_list.push({
                      name: _doc.name,
                      item_group: _doc.item_group,
                      size_ar: _sizes.size_ar,
                      size_en: _sizes.size_en,
                      barcode: _sizes.barcode,
                      re_order_limit: count,
                      current_count: _SizeBranch.current_count,
                    })
                  }

                }
              });
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