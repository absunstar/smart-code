module.exports = function init(site) {

  const $employees_report = site.connectCollection("hr_employees_report")

  site.get({
    name: "employees_report",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/employees_report/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = ' not login'
      res.json(response)
      return
    }

    let doc = req.body

    doc.company = site.get_company(req)
    doc.branch = site.get_branch(req)

    doc.$req = req
    doc.$res = res

    delete doc._id
    delete doc.id


    $employees_report.add(doc, (err, doc2) => {
      if (!err) {
        let obj = {
          value: doc.total_salary || 0,
          safe: doc.safe,
          date: doc.date,
          company: doc.company,
          branch: doc.branch,
          sourceName: doc.name,
          operation: 'مرتب موظف',
          transition_type: 'out',
          description: doc.description
        }

        site.call('[employee_report][safes]', obj)

        response.done = true
        response.doc = doc2
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.post("/api/employees_report/all", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $employees_report.findMany({
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