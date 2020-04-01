module.exports = function init(site) {
  const $request_service = site.connectCollection("request_service")
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

    where['company.id'] = site.get_company(req).id

    $request_service.findMany({
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
            let request_services_list = [];
            request_docs.forEach(_request_service => {
              if (new Date(_request_service.date_to) >= new Date()) {
                request_services_list.unshift({
                  service_name: _request_service.service_name,
                  complex_service: _request_service.selectedServicesList,
                  date_from: _request_service.date_from,
                  date_to: _request_service.date_to,
                  time_from: _request_service.time_from,
                  time_to: _request_service.time_to,
                  remain: _request_service.remain,
                  id: _request_service.id
                });
              }
            });



            request_services_list.forEach(_request_services => {
              if (_request_services.complex_service && _request_services.complex_service.length > 0) {
                let total_remain = 0;
                _request_services.complex_service.map(_complex_service => total_remain += _complex_service.remain)
                _request_services.remain = total_remain
              }
              
              invoice_docs.forEach(_account_invoices => {
    
                if (_request_services.id == _account_invoices.invoice_id) {
                  
                  _request_services.invoice_remain = _account_invoices.remain_amount
                }
              });

              let gifTime = Math.abs(new Date() - new Date(_request_services.date_to))
              _request_services.ex_service = Math.ceil(gifTime / (1000 * 60 * 60 * 24))
            });

            response.list = request_services_list
            response.count = count
          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })
  })

}