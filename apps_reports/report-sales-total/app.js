module.exports = function init(site) {
  const $stores_out = site.connectCollection("stores_out")
  // const $stores_items = site.connectCollection("stores_items")

  site.get({
    name: "report_sales_total",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_sales_total/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};

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

    if (where['name']) {
      where['items.name'] = new RegExp(where['name'], 'i')
      delete where['name']
    }

    if (where['unit']) {
      where['items.unit.id'] = where['unit'].id;
      delete where['unit']
    }

    if (where['size']) {
      where['items.size'] = new RegExp(where['size'], 'i')
      delete where['size']
    }

    if (where['barcode']) {
      where['items.barcode'] = new RegExp(where['barcode'], 'i')
      delete where['barcode']
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    where['$or'] = [{ 'type.id': 1 }, { 'type.id': 3 }, { 'type.id': 4 }, { 'type.id': 7 }]

    $stores_out.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err1, docs) => {
      if (!err1) {


        let total_size_list = []

        for (let i = 0; i < docs.length; i++) {

          docs[i].items.forEach(_item => {
            let exist = false

            if (total_size_list.length > 0) {
              total_size_list.forEach(_size => {
                if (_item.unit && _size.unit && _size.barcode == _item.barcode && _size.unit.id == _item.unit.id) {
                  _size.total = site.toNumber(_size.total) + site.toNumber(_item.total)
                  _size.count = site.toNumber(_size.count) + site.toNumber(_item.count)
                  _size.average_cost = site.toNumber(_size.average_cost) + (site.toNumber(_item.average_cost) * site.toNumber(_item.count))
                  exist = true
                }
              })
            }

            if (!exist) {
              _item.count = site.toNumber(_item.count)
              _item.total = site.toNumber(_item.total)
              _item.average_cost = (site.toNumber(_item.average_cost) * site.toNumber(_item.count))

              total_size_list.push(Object.assign({}, _item))
            }
          })
        }


        response.done = true
        response.doc = total_size_list
        res.json(response)

      } else {
        response.error = err.message
      }
    })



    // $stores_out.findMany({
    //   select: req.body.select || {},
    //   where: where,
    //   sort: req.body.sort || { id: -1 },
    //   limit: req.body.limit
    // }, (err1, docs) => {
    //   if (!err1) {
    //     $stores_items.findMany({
    //       where: { 'company.id': site.get_company(req).id },
    //     }, (err2, docs_stores_items) => {

    //       let total_size_list = []
    //       let item_size_list = []

    //       docs_stores_items.forEach(_stores_items => {
    //         if (_stores_items.sizes && _stores_items.sizes.length > 0)
    //           _stores_items.sizes.forEach(_item_size => {
    //             if (_item_size.branches_list)
    //               _item_size.branches_list.forEach(_branches_list => {
    //                 if (_branches_list.code == site.get_branch(req).code) {
    //                   item_size_list.push({
    //                     barcode: _item_size.barcode,
    //                     average_cost: _item_size.average_cost,
    //                   })
    //                 }
    //               });
    //           });
    //       });

    //       for (let i = 0; i < docs.length; i++) {

    //         let exist = false

    //         docs[i].items.forEach(_item => {
    //           let found = false

    //           if (total_size_list.length > 0) {
    //             total_size_list.forEach(_size => {
    //               if (_size.barcode == _item.barcode) {
    //                 _size.total = _size.total + _item.total
    //                 _size.count = _size.count + _item.count
    //                 exist = true

    //                 item_size_list.forEach(_item_size => {

    //                   if (_size.barcode == _item_size.barcode) {

    //                     if (!found) _size.average_cost = _item_size.average_cost

    //                     found = true
    //                   }

    //                 });

    //               }
    //             })
    //           }
    //           if (!exist) {
    //             total_size_list.push(Object.assign({}, _item))
    //           }
    //         })
    //       }

    //       response.done = true
    //       response.doc = total_size_list
    //       res.json(response)
    //     })

    //   } else {
    //     response.error = err.message
    //   }
    // })
  })

}