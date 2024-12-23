module.exports = function init(site) {
  const $request_activity = site.connectCollection("request_activity")
  const $account_invoices = site.connectCollection("account_invoices")

  site.get({
    name: "report_info",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_info/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer']

    } else if (req.session.user.ref_info) {

      where['customer.id'] = req.session.user.ref_info.id
    }


    if (where['count_ex']) {
      let count_ex = new Date()
      count_ex.setDate(count_ex.getDate() + where['count_ex'])
      let d1 = site.toDate(count_ex)
      let d2 = site.toDate(count_ex)
      d2.setDate(d2.getDate() + 1)
      where.date_to = {
        '$gte': d1,
        '$lt': d2
      }
      delete where['count_ex']

    }

    where['company.id'] = site.get_company(req).id

    $request_activity.findMany({
      where: where,
      sort: req.body.sort || { id: -1 },
    }, (err, request_docs, count) => {
      if (!err) {
        response.done = true
        let invoice_id = request_docs.map(_rd => _rd.id)
        $account_invoices.findMany(
          { 'invoice_id': invoice_id }
          , (invoice_err, invoice_docs) => {
            if (!invoice_err) {
              let request_activities_list = [];
              request_docs.forEach(_request_activity => {
                if (new Date(_request_activity.date_to) >= new Date()) {
                  request_activities_list.push({
                    customer: _request_activity.customer,
                    activity_name_Ar: _request_activity.activity_name_Ar,
                    activity_name_en: _request_activity.activity_name_en,
                    complex_activity: _request_activity.complex_activities_list,
                    date_from: _request_activity.date_from,
                    date_to: _request_activity.date_to,
                    time_from: _request_activity.time_from,
                    time_to: _request_activity.time_to,
                    remain: _request_activity.remain,
                    current_attendance: _request_activity.current_attendance,
                    id: _request_activity.id
                  });
                }
              });



              request_activities_list.forEach(_request_activities => {
                if (_request_activities.complex_activity && _request_activities.complex_activity.length > 0) {
                  let total_remain = 0;
                  let total_attendance = 0;
                  _request_activities.complex_activity.forEach(_complex_activity => {

                    total_remain += _complex_activity.remain
                    total_attendance += _complex_activity.current_attendance
                  })
                  _request_activities.remain = total_remain
                }

                invoice_docs.forEach(_account_invoices => {

                  if (_request_activities.id == _account_invoices.invoice_id) {
                    _request_activities.invoice_remain = _account_invoices.remain_amount
                  }
                });

                let gifTime = Math.abs(new Date() - new Date(_request_activities.date_to))
                _request_activities.ex_activity = Math.ceil(gifTime / (1000 * 60 * 60 * 24))
              });

              response.list = request_activities_list
              response.count = request_activities_list.length
            } else {
              response.error = err.message
            }
            res.json(response)
          })
      }
    })
  })

}