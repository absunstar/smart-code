module.exports = function init(site) {
  const $attend_students = site.connectCollection("attend_students")

  site.get({
    name: "report_attend_students",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/report_attend_students/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};
    let customer = where.customer;

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    };

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    };

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

    if (where['customer']) {
      where['attend_list.customer.id'] = where['customer'].id;
      delete where['customer']
      
    }

    if (where['school_grade']) {
      where['school_grade.id'] = where['school_grade'].id;
      delete where['school_grade']
      
    }

    if (where['hall']) {
      where['hall.id'] = where['hall'].id;
      delete where['hall']
      
    }

    // where['$or'] = [{ 'source_type.id': 2 }, { 'source_type.id': 3 }, { 'source_type.id': 4 }, { 'source_type.id': 7 }]

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    $attend_students.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err && docs) {
        docs.forEach(_docs => {
          _docs.attend_list.forEach(_att => {
            if(customer && customer.id && _att.customer.id == customer.id){
              _docs.status = _att.status
              _docs.attend_time = _att.attend_time
              _docs.leave_time = _att.leave_time
            }
          });
        });
        response.done = true
        response.list = docs
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}
