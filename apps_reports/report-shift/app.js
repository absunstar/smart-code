module.exports = function init(site) {
  const $shifts = site.connectCollection("shifts")

  site.get({
    name: "report_shift",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_shift/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    $shifts.findOne({
      where: {
        id: req.body.id
      }
    }, (err, doc) => {
      if (!err) {
        
        site.safesPaymentsShift(req.body.id, accountInvoicesDocs => {

          let obj = {}
          obj.accounts_count =  accountInvoicesDocs.length
          accountInvoicesDocs.forEach(_acc_Inv_doc => {
            obj.total_discount =  _acc_Inv_doc.total_discount
            obj.total_tax =  _acc_Inv_doc.total_tax
            obj.total_remain =  _acc_Inv_doc.total_remain
            
          });
    
    
        })

        response.done = true
        response.doc = 
        res.json(response)

      } else {
        response.error = err.message
      }
    })

  })

}