module.exports = function init(site) {
  const $order_invoice = site.connectCollection("order_invoice")

  site.get({
    name: "report_employee_user",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_employee_user/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};

    let employee = where.employee

    if (where['code']) {
      where['code'] = new RegExp(where['code'], 'i')
    };

    if (where['name']) {
      where['name'] = new RegExp(where['name'], 'i')
    };

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    };

    if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to
    };

    if(!where.date && !where.date_from){
      let d1 = site.toDate(new Date())
      let d2 = site.toDate(new Date())
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    $and = [
      { 'add_user_info.id': where['employee'].user_info.id },
      { 'edit_user_info.id': where['employee'].user_info.id },
      delete where['employee']
    ]


    where['status.id'] = {
      '$gte': 4,
      '$lte': 5
    };

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
        let add_order = [];
        let close_order = [];
        docs.forEach(order => {
          if (order.add_user_info && employee.user_info) {
            if (order.add_user_info.id == employee.user_info.id) {
              add_order.push(order)
            }
          }
          if (order.edit_user_info && employee.user_info) {
            if (order.edit_user_info.id == employee.user_info.id) {
              close_order.push(order)
            }
          }
        })
        let doc = {
          employee: employee,
          add_order: add_order,
          close_order: close_order
        }
        response.list = doc
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}