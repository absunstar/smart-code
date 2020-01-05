module.exports = function init(site) {
  const $stores_out = site.connectCollection("stores_out")

  site.get({
    name: "report_sales",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_sales/all", (req, res) => {
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
    }

    if (where['size']) {
      where['items.size'] = new RegExp(where['size'], 'i')
    }

    if (where['barcode']) {
      where['items.barcode'] = new RegExp(where['barcode'], 'i')
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $stores_out.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs) => {
      if (!err) {
        response.done = true
        let obj = {
          total_size_list: [],
          detailed_size_list: []
        }
     

        for (let i = 0; i < docs.length; i++) {

          let exist = false

          docs[i].items.forEach(_item => {
         /*    _item.type = docs[i].type
            _item.code = docs[i].number

            obj.detailed_size_list.push(_item) */
            if (obj.total_size_list.length > 0) {

              obj.total_size_list.forEach(_size => {
                if (_size.barcode == _item.barcode) {
                  _size.total = _size.total + _item.total
                  _size.count = _size.count + _item.count
                  exist = true
                }
              })
            }
            if (!exist) obj.total_size_list.push(_item)
          })
        }

 


        response.doc = obj

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}