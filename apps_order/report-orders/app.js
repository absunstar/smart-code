module.exports = function init(site) {
  const $order_invoice = site.connectCollection('order_invoice')

  site.get({
    name: "report_orders",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_orders/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};
    let where2 = Object.assign({}, where);

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to
    }

    if (where['size_ar']) {
      where['book_list.size_ar'] = where['size_ar']
      delete where['size_ar']
    }
    if (where['size_en']) {
      where['book_list.size_en'] = where['size_en']
      delete where['size_en']
    }
    if (where['barcode']) {
      where['book_list.barcode'] = where['barcode']
      delete where['barcode']

    }

    if (where['item_group']) {
      where['book_list.item_group.id'] = where['item_group'].id;
      delete where['item_group']
    }

    if (where['name']) {
      where['book_list.name'] = where['name']
      delete where['name']
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code


    $order_invoice.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        let sizes_list = []
        docs.forEach(_doc => {
          let exist = false
          _doc.book_list.forEach(itm => {
            sizes_list.forEach(_size => {
              if (_size.barcode == itm.barcode) {
                _size.count = _size.count + itm.count;
                exist = true;
              }
            })

            if (!exist) {
              if (where2['size_ar'] || where2['barcode'] || where2['name']) {

                if (where2['size_ar'] == itm.size_ar || where2['name'] == itm.name || where2['barcode'] == itm.barcode)
                  sizes_list.push(itm);

              } else sizes_list.push(itm);
            }
          })
        })

        response.list = sizes_list;
        response.count = count;
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}