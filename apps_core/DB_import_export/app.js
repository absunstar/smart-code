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
    name: "DB_import_export",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })


 

  site.post("/api/amounts_in/import_file_amount_in", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }


    $amounts_in.import(__dirname + "/site_files/db/amount_in",(err , docs)=>{})
  })
  site.get("/api/amounts_in/export_file_amount_in", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      res.json(response)
      return
    }
  

     $amounts_in.export({limit :  100000} ,__dirname + "/site_files/db/amount_in",(err , docs)=>{
      res.download(__dirname + "/site_files/db/amount_in")
     })

  
})

  site.post("/api/amounts_out/import_file_amount_out", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    console.log("sssssssssssssssssssssss");

    $amounts_out.import(__dirname + "/site_files/db/amount_out",(err , docs)=>{})
  })
  site.get("/api/amounts_out/export_file_amount_out", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $amounts_out.export({limit :  100000} ,__dirname + "/site_files/db/amount_out",(err , docs)=>{
      res.download(__dirname + "/site_files/db/amount_out")
     })
  })

  site.post("/api/safes/import_file_safes", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }


    $safes.import(__dirname + "/site_files/db/safes",(err , docs)=>{})
  })
  site.get("/api/safes/export_file_safes", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $safes.export({limit :  100000} ,__dirname + "/site_files/db/safes",(err , docs)=>{
      res.download(__dirname + "/site_files/db/safes")
     })
  })

  site.post("/api/in_out_names/import_file_in_out_names", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }


    $in_out_names.import(__dirname + "/site_files/db/in_out_names",(err , docs)=>{})
  })
  site.get("/api/in_out_names/export_file_in_out_names", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $in_out_names.export({limit :  100000} ,__dirname + "/site_files/db/in_out_names",(err , docs)=>{
      res.download(__dirname + "/site_files/db/in_out_names")
     })
  })

  site.post("/api/employee_offer/import_file_employee_offer", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }


    $employee_offer.import(__dirname + "/site_files/db/employee_offer",(err , docs)=>{})
  })
  site.get("/api/employee_offer/export_file_employee_offer", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $employee_offer.export({limit :  100000} ,__dirname + "/site_files/db/employee_offer",(err , docs)=>{
      res.download(__dirname + "/site_files/db/employee_offer")
     })
  })
  
  site.post("/api/employee_discount/import_file_employee_discount", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }


    $employee_discount.import(__dirname + "/site_files/db/employee_discount",(err , docs)=>{})
  })
  site.get("/api/employee_discount/export_file_employee_discount", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $employee_discount.export({limit :  100000} ,__dirname + "/site_files/db/employee_discount",(err , docs)=>{
      res.download(__dirname + "/site_files/db/employee_discount")
     })
  })
 
  site.post("/api/employees_advances/import_file_employees_advances", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }


    $employees_advances.import(__dirname + "/site_files/db/employees_advances",(err , docs)=>{})
  })
  site.get("/api/employees_advances/export_file_employees_advances", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $employees_advances.export({limit :  100000} ,__dirname + "/site_files/db/employees_advances",(err , docs)=>{
      res.download(__dirname + "/site_files/db/employees_advances")
     })
  })
  site.post("/api/employees_insurances/import_file_employees_insurances", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }


    $employees_insurances.import(__dirname + "/site_files/db/employees_insurances",(err , docs)=>{})
  })
  site.get("/api/employees_insurances/export_file_employees_insurances", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $employees_insurances.export({limit :  100000} ,__dirname + "/site_files/db/employees_insurances",(err , docs)=>{
      res.download(__dirname + "/site_files/db/employees_insurances")
     })
  })
  site.post("/api/insurances_slides/import_file_insurances_slides", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }


    $insurances_slides.import(__dirname + "/site_files/db/insurances_slides",(err , docs)=>{})
  })
  site.get("/api/insurances_slides/export_file_insurances_slides", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $insurances_slides.export({limit :  100000} ,__dirname + "/site_files/db/insurances_slides",(err , docs)=>{
      res.download(__dirname + "/site_files/db/insurances_slides")
     })
  })
 
  site.post("/api/customers/import_file_customers", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }


    $customers.import(__dirname + "/site_files/db/customers",(err , docs)=>{})
  })
  site.get("/api/customers/export_file_customers", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $customers.export({limit :  100000} ,__dirname + "/site_files/db/customers",(err , docs)=>{
      res.download(__dirname + "/site_files/db/customers")
     })

  })

  site.post("/api/stores/import_file_stores", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }


    $stores.import(__dirname + "/site_files/db/stores",(err , docs)=>{})
  })
  site.get("/api/stores/export_file_stores", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $stores.export({limit :  100000} ,__dirname + "/site_files/db/stores",(err , docs)=>{
      res.download(__dirname + "/site_files/db/stores")
     })
  })


  site.post("/api/stores_in/import_file_stores_in", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }


    $stores_in.import(__dirname + "/site_files/db/stores_in",(err , docs)=>{})
  })
  site.get("/api/stores_in/export_file_stores_in", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $stores_in.export({limit :  100000} ,__dirname + "/site_files/db/stores_in",(err , docs)=>{
      res.download(__dirname + "/site_files/db/stores_in")
     })
  })

  site.post("/api/stores_out/import_file_stores_out", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $stores_out.import(__dirname + "/site_files/db/stores_out",(err , docs)=>{})
  })
  site.get("/api/stores_out/export_file_stores_out", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $stores_out.export({limit :  100000} ,__dirname + "/site_files/db/stores_out",(err , docs)=>{
      res.download(__dirname + "/site_files/db/stores_out")
     })
  })


  site.post("/api/transfer_branch/import_file_transfer_branch", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $transfer_branch.import(__dirname + "/site_files/db/transfer_branch",(err , docs)=>{})
  })
  
  site.get("/api/transfer_branch/export_file_transfer_branch", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $transfer_branch.export({limit :  100000} ,__dirname + "/site_files/db/transfer_branch",(err , docs)=>{
      res.download(__dirname + "/site_files/db/transfer_branch")
     })
  })

  
  site.post("/api/tax_types/import_file_tax_types", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $tax_types.import(__dirname + "/site_files/db/tax_types",(err , docs)=>{})
  })
  site.get("/api/tax_types/export_file_tax_types", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $tax_types.export({limit :  100000} ,__dirname + "/site_files/db/tax_types",(err , docs)=>{
      res.download(__dirname + "/site_files/db/tax_types")
     })
  })

  site.post("/api/discount_types/import_file_discount_types", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $discount_types.import(__dirname + "/site_files/db/tax_types",(err , docs)=>{})
  })
  site.get("/api/discount_types/export_file_discount_types", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $discount_types.export({limit :  100000} ,__dirname + "/site_files/db/discount_types",(err , docs)=>{
      res.download(__dirname + "/site_files/db/discount_types")
     })
  })
  
 

  site.post("/api/goves/import_file_goves", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $goves.import(__dirname + "/site_files/db/goves",(err , docs)=>{})
  })
  site.get("/api/goves/export_file_goves", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $goves.export({limit :  100000} ,__dirname + "/site_files/db/goves",(err , docs)=>{
      res.download(__dirname + "/site_files/db/goves")
     })
  })

  site.post("/api/cities/import_file_cities", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $cities.import(__dirname + "/site_files/db/cities",(err , docs)=>{})
  })
  site.get("/api/cities/export_file_cities", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $goves.export({limit :  100000} ,__dirname + "/site_files/db/cities",(err , docs)=>{
      res.download(__dirname + "/site_files/db/cities")
     })
  })


  site.post("/api/vendors/import_file_vendors", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $vendors.import(__dirname + "/site_files/db/vendors",(err , docs)=>{})
  })
  site.get("/api/vendors/export_file_vendors", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $vendors.export({limit :  100000} ,__dirname + "/site_files/db/vendors",(err , docs)=>{
      res.download(__dirname + "/site_files/db/vendors")
     })
  })
  

  site.post("/api/employees/import_file_employees", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $employees.import(__dirname + "/site_files/db/employees",(err , docs)=>{})
  })
  site.get("/api/employees/export_file_employees", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $employees.export({limit :  100000} ,__dirname + "/site_files/db/employees",(err , docs)=>{
      res.download(__dirname + "/site_files/db/employees")
     })
  })
  
  site.post("/api/jobs/import_file_jobs", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $jobs.import(__dirname + "/site_files/db/jobs",(err , docs)=>{})
  })
  site.get("/api/jobs/export_file_jobs", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $jobs.export({limit :  100000} ,__dirname + "/site_files/db/jobs",(err , docs)=>{
      res.download(__dirname + "/site_files/db/jobs")
     })
  })
  
  site.post("/api/employees_degrees/import_file_employees_degrees", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $employees_degrees.import(__dirname + "/site_files/db/employees_degrees",(err , docs)=>{})
  })
  site.get("/api/employees_degrees/export_file_employees_degrees", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $employees_degrees.export({limit :  100000} ,__dirname + "/site_files/db/employees_degrees",(err , docs)=>{
      res.download(__dirname + "/site_files/db/employees_degrees")
     })
  })


  site.post("/api/militaries_status/import_file_militaries_status", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $militaries_status.import(__dirname + "/site_files/db/militaries_status",(err , docs)=>{})
  })
  site.get("/api/militaries_status/export_file_militaries_status", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $militaries_status.export({limit :  100000} ,__dirname + "/site_files/db/militaries_status",(err , docs)=>{
      res.download(__dirname + "/site_files/db/militaries_status")
     })
  })

  site.post("/api/maritals_status/import_file_maritals_status", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }

    $maritals_status.import(__dirname + "/site_files/db/maritals_status",(err , docs)=>{})
  })
  site.get("/api/maritals_status/export_file_maritals_status", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      res.json(response)
      return
    }
    $maritals_status.export({limit :  100000} ,__dirname + "/site_files/db/maritals_status",(err , docs)=>{
      res.download(__dirname + "/site_files/db/maritals_status")
     })
  })



}