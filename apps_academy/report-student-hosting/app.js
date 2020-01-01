module.exports = function init(site) {
  const $hosting = site.connectCollection("hosting")

  site.get({
    name: "report_student_hosting",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/hosting/student_hosting_report", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['student']) {
      where['student.id'] = where['student'].id;
      delete where['student']
      delete where.active
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $hosting.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
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