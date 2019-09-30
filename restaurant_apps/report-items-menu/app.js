module.exports = function init(site) {
  const $items_menu = site.connectCollection("items_menu")

  site.get({
    name: "report_items_menu",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/items_menu/display_items", (req, res) => {
    let response = {
      done: false
    }

    var where = req.body.where || {}

    if (where['code']) {
      where['code'] = new RegExp(where['code'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $items_menu.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true

        response.list = [];
        docs.forEach(b => {
          b.book_list.forEach(d => {

            if (b.code) {
              response.list.push({
                code: b.code,
                date: b.date,
                name: d.name,
                size: d.size,
                vendor: d.vendor,
                store: d.store,
                count: d.count,
                price: d.price,
                total_price: d.total_price

              })
            }
          });
        });

        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


}