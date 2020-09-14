module.exports = function init(site) {
  const $stores_out = site.connectCollection("stores_out")

  site.get({
    name: "report_sales_detailed",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_sales_detailed/all", (req, res) => {
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
        '$lte': d2
      }
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lte': d2
      }
      delete where.date_from
      delete where.date_to
    }

    if (where['name']) {
      where['items.name'] = site.get_RegExp(where['name'], 'i')
    }

    if (where['item_group']) {
      where['items.item_group.id'] = where['item_group'].id;
      delete where['item_group']
    }

    if (where['size']) {
      where['items.size'] = site.get_RegExp(where['size'], 'i')
    }

    if (where['barcode']) {
      where['items.barcode'] = site.get_RegExp(where['barcode'], 'i')
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    where['type.id'] = {$ne : 5}
    where['posting'] = true

    $stores_out.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs) => {
      if (!err) {
        response.done = true

        let detailed_size_list = []

        for (let i = 0; i < docs.length; i++) {
          docs[i].items.forEach(_item => {
            _item.type = docs[i].type
            _item.code = docs[i].number
            _item.date = docs[i].date
            detailed_size_list.push(Object.assign({}, _item))
          })
        }

        response.doc = detailed_size_list

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}