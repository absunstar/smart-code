module.exports = function init(site) {
  const $amounts_in = site.connectCollection("amounts_in")
  const $amounts_out = site.connectCollection("amounts_out")
  const $safes = site.connectCollection("safes")
  const $in_out_names = site.connectCollection("in_out_names")
  const $employee_offer = site.connectCollection("employee_offer")
  const $employee_discount = site.connectCollection("employee_discount")
  const $employees_advances = site.connectCollection("employees_advances")
  const $employees_insurances = site.connectCollection("employees_insurances")
  const $insurances_slides = site.connectCollection("insurances_slides")
  const $customers = site.connectCollection('customers')
  const $stores = site.connectCollection("stores")
  const $stores_items = site.connectCollection("stores_items")
  const $stores_in = site.connectCollection("stores_in")
  const $stores_out = site.connectCollection("stores_out")
  const $transfer_branch = site.connectCollection("transfer_branch")

  const $tax_types = site.connectCollection("tax_types")
  const $discount_types = site.connectCollection("discount_types")

  const $goves = site.connectCollection("goves")
  const $cities = site.connectCollection("cities")
  const $vendors = site.connectCollection("vendors")
  const $employees = site.connectCollection("employees")
  const $jobs = site.connectCollection("jobs")
  const $employees_degrees = site.connectCollection("employees_degrees")
  const $militaries_status = site.connectCollection("militaries_status")
  const $maritals_status = site.connectCollection("maritals_status")



  site.get({
    name: "db",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })


  site.post("api/db/import", (req, res) => {
    var response = {
      done: true,
      collection_name: req.headers.collection_name ,
      file_path: req.files.collectionFile.path,
    }

    site.connectCollection(response.collection_name).import(response.file_path, (errs, docs) => {
      response.errors = errs
      res.end(JSON.stringify(response))
    })
    
  })

  site.get("api/db/export", (req, res) => {

    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      response.error = 'You are not login'
      res.json(response)
      return
    }
    let collection_name = req.query.name
    let path = site.path.join(site.options.download_dir, collection_name + '.json')

    site.connectCollection(collection_name).export({
      limit: 1000000
    }, path, (result) => {
      if (!result.done) {
        res.json(result)
      } else {
        res.download(result.file_path)
      }

    })
  })



}