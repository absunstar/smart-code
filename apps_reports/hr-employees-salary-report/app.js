module.exports = function init(site) {

  const $employees_salary_report = site.connectCollection("hr_employees_salary_report")

  site.get({
    name: "employees_salary_report",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.post("/api/employees_salary_report/add", (req, res) => {
    let response = {}
    response.done = false
      
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let doc = req.body

    doc.$req = req
    doc.$res = res

    delete doc._id
    delete doc.id

    $employees_salary_report.add(doc, (err, doc2) => {
      if (!err) {
        let obj = {
          value: doc.total_salary || 0,
          safe: doc.safe,
          date: doc.date,
          source_name_ar: doc.employee.name_ar,
          source_name_en: doc.employee.name_en,
          description: doc.description,
          shift: {
            id: doc.shift.id,
            code: doc.shift.code,
            name_ar: doc.shift.name_ar, name_en: doc.shift.name_en
          },
          operation: {ar: 'مرتب موظف', en: 'Employee salary'},
          transition_type: 'out',
          company: doc.company,
          branch: doc.branch
        }

        site.quee('[amounts][safes][+]', obj)

        response.done = true
        response.doc = doc2
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.post("/api/employees_salary_report/all", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $employees_salary_report.findMany({
      select: req.body.select || {},
      where: req.body.where || {},
      limit: req.body.limit,
      sort: {
        id: -1
      }
    }, (err, docs) => {
      if (!err) {
        response.done = true
        response.list = docs
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })



}