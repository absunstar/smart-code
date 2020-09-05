module.exports = function init(site) {
  const $item_transaction = site.connectCollection("item_transaction")
  // const $stores_items = site.connectCollection("stores_items")

  site.get({
    name: "report_transaction_total",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_transaction_total/all", (req, res) => {
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
      where['name'] = new RegExp(where['name'], 'i')
    }

    if (where['size']) {
      where['size'] = new RegExp(where['size'], 'i')
    }

    if (where['item_group']) {
      where['item_group.id'] = where['item_group'].id;
      delete where['item_group']
    }

    if (where['barcode']) {
      where['barcode'] = new RegExp(where['barcode'], 'i')
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $item_transaction.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err1, docs) => {
      if (!err1) {


        let total_size_list = []

        for (let i = 0; i < docs.length; i++) {

          let exist = false

          if (total_size_list.length > 0) {
            total_size_list.forEach(_size => {
              if (_size.barcode == docs[i].barcode) {
                if (docs[i].transaction_type == 'in') {
                  _size.count_in = (site.toNumber(_size.count_in) || 0) + (site.toNumber(docs[i].count) || 0)

                } else {
                  _size.count_out = (site.toNumber(_size.count_out) || 0) + (site.toNumber(docs[i].count) || 0)
                  // _size.average_cost = (site.toNumber(_size.average_cost || 0) + (site.toNumber(docs[i].average_cost || 0)) * site.toNumber((docs[i].count || 0)))

                }
                exist = true
              }
              _size.current_count = (site.toNumber(_size.count_in) || 0) - (site.toNumber(_size.count_out) || 0)
            })
          }
          if (!exist) {
            let obj = Object.assign({}, docs[i])

            if (obj.transaction_type == 'in') {
              obj.count_in = (site.toNumber(obj.count) || 0)

            } else if (obj.transaction_type == 'out') {
              obj.count_out = (obj.count || 0)
              // obj.average_cost = site.toNumber(obj.average_cost || 0) * site.toNumber(obj.count || 0)

            }

            total_size_list.push(obj)
          }
        }
        total_size_list.map(_list => _list.average_cost = site.toNumber(_list.average_cost) * _list.current_count)
        response.done = true
        response.doc = total_size_list
        res.json(response)

      } else {
        response.error = err.message
      }
    })

  })

}