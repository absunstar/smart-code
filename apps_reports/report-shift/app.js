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

    site.getAmountsInShift(req.body.id, amountsIn => {
      site.getAmountsOutShift(req.body.id, amountsOut => {
        site.getAccountInvoiceShift(req.body.id, accountInvoice => {


        })
      })
    })

    
  })


}